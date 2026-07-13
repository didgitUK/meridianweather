'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ADSENSE_DEFAULT_RANGE,
} from '@/constants/adsense-reports';
import { AdminAdSenseBreakdownCharts } from '@/features/admin/components/adsense/AdminAdSenseBreakdownCharts';
import { AdminAdSenseConnectionBar } from '@/features/admin/components/adsense/AdminAdSenseConnectionBar';
import { AdminAdSenseEarningsHero } from '@/features/admin/components/adsense/AdminAdSenseEarningsHero';
import { AdminAdSenseKpiGrid } from '@/features/admin/components/adsense/AdminAdSenseKpiGrid';
import { AdminAdSenseTrendCharts } from '@/features/admin/components/adsense/AdminAdSenseTrendCharts';
import { AdminAdSenseUnitSettings } from '@/features/admin/components/adsense/AdminAdSenseUnitSettings';

export function AdminAdSensePanel({ settings, ads, onUpdated }) {
  const [rangeId, setRangeId] = useState(ADSENSE_DEFAULT_RANGE);
  const [report, setReport] = useState(null);
  const [reporting, setReporting] = useState(ads?.reporting ?? null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const connected = Boolean(reporting?.connected);

  const loadReport = useCallback(async (nextRange, { refresh = false } = {}) => {
    setIsLoading(true);
    setError('');

    try {
      const query = new URLSearchParams({ range: nextRange });
      if (refresh) {
        query.set('refresh', '1');
      }

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

  function handleConnect() {
    window.location.href = '/api/admin/adsense/oauth/start';
  }

  async function handleDisconnect() {
    setIsDisconnecting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/adsense/oauth/disconnect', { method: 'POST' });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Unable to disconnect');
      }

      setReporting(payload.reporting);
      setReport(null);
      onUpdated?.({ ads: { ...ads, reporting: payload.reporting } });
    } catch (disconnectError) {
      setError(disconnectError.message);
    } finally {
      setIsDisconnecting(false);
    }
  }

  async function handleSync() {
    setIsSyncing(true);
    setError('');

    try {
      const response = await fetch('/api/admin/adsense/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ range: rangeId }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Unable to refresh report');
      }

      setReporting(payload.reporting);
      setReport(payload.report);
      setNote(payload.note || '');
      onUpdated?.({ ads: { ...ads, reporting: payload.reporting } });
    } catch (syncError) {
      setError(syncError.message);
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminAdSenseConnectionBar
        reporting={reporting}
        isSyncing={isSyncing || isLoading}
        isDisconnecting={isDisconnecting}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onSync={handleSync}
        error={error}
      />

      <AdminAdSenseEarningsHero
        rangeId={rangeId}
        onRangeChange={setRangeId}
        formattedEarnings={report?.formatted?.estimatedEarnings}
        connected={connected}
        note={
          connected
            ? note || 'Estimated earnings are accurate through yesterday.'
            : 'Connect Google to see what AdSense has earned for Meridian.'
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

      <AdminAdSenseUnitSettings settings={settings} ads={ads} onUpdated={onUpdated} />
    </div>
  );
}
