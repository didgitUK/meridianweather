'use client';

import { useCallback, useEffect, useState } from 'react';
import { ADSENSE_DEFAULT_RANGE } from '@/constants/adsense-reports';
import { AdminAdSenseBreakdownCharts } from '@/features/admin/components/adsense/AdminAdSenseBreakdownCharts';
import { AdminAdSenseEarningsHero } from '@/features/admin/components/adsense/AdminAdSenseEarningsHero';
import { AdminAdSenseKpiGrid } from '@/features/admin/components/adsense/AdminAdSenseKpiGrid';
import { AdminAdSenseTrendCharts } from '@/features/admin/components/adsense/AdminAdSenseTrendCharts';

/**
 * Dashboard-facing AdSense income view — charts only (OAuth connect lives under Connectors → AdSense).
 */
export function DashboardAdSensePanel({ ads }) {
  const [rangeId, setRangeId] = useState(ADSENSE_DEFAULT_RANGE);
  const [report, setReport] = useState(null);
  const [reporting, setReporting] = useState(ads?.reporting ?? null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const connected = Boolean(reporting?.connected);

  const loadReport = useCallback(async (nextRange) => {
    setIsLoading(true);
    setError('');

    try {
      const query = new URLSearchParams({ range: nextRange });
      const response = await fetch(`/api/admin/adsense/report?${query.toString()}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Unable to load AdSense report');
      }

      setReporting(payload.reporting ?? null);
      setReport(payload.report);
      setNote(payload.note || '');

      if (payload.syncError) {
        setError(payload.syncError);
      }
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      setReporting(ads?.reporting ?? null);
    });
  }, [ads?.reporting]);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (!cancelled) {
        void loadReport(rangeId);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [rangeId, loadReport]);

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {isLoading && !report ? (
        <p className="text-sm text-muted-foreground">Loading AdSense report…</p>
      ) : null}

      <AdminAdSenseEarningsHero
        rangeId={rangeId}
        onRangeChange={setRangeId}
        formattedEarnings={report?.formatted?.estimatedEarnings}
        connected={connected}
        note={
          connected
            ? note || 'Estimated earnings are accurate through yesterday.'
            : 'Connect AdSense under Connectors → AdSense, then refresh this view.'
        }
      />

      <AdminAdSenseKpiGrid formatted={report?.formatted} connected={connected} />

      <AdminAdSenseTrendCharts
        series={report?.earningsSeries}
        currencyCode={report?.currencyCode}
        connected={connected}
      />

      <AdminAdSenseBreakdownCharts
        topPages={report?.topPages}
        platforms={report?.platforms}
        countries={report?.countries}
        currencyCode={report?.currencyCode}
        connected={connected}
      />
    </div>
  );
}
