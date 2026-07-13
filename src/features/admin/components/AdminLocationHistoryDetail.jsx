'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { labelWeatherCheckTrigger } from '@/constants/weather-check-triggers';
import { Button } from '@/components/ui/button';
import { AdminPanel } from '@/features/admin/components/AdminPanel';
import { AdminLocationInsightGrid } from '@/features/admin/components/AdminLocationInsightGrid';
import { formatTemperature } from '@/features/weather/utils/formatWeather';

export function AdminLocationHistoryDetail({ locationId, onBack, onRefresh }) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDetail() {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/admin/locations?locationId=${encodeURIComponent(locationId)}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message ?? 'Unable to load location history');
        }

        if (!cancelled) {
          setDetail(payload);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      cancelled = true;
    };
  }, [locationId]);

  async function handleSeedDemo() {
    setIsSeeding(true);
    setError('');

    try {
      const response = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId, action: 'seed-demo' }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to seed demo archive');
      }

      setDetail(payload.detail);
      await onRefresh?.();
    } catch (seedError) {
      setError(seedError.message);
    } finally {
      setIsSeeding(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading location checks…</p>;
  }

  if (error && !detail) {
    return (
      <div className="flex flex-col gap-3">
        <Button type="button" variant="ghost" className="w-fit gap-2 px-0" onClick={onBack}>
          <ArrowLeft className="size-4" aria-hidden />
          Back to checks log
        </Button>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  const location = detail?.location;
  const label = location?.label ?? location?.name ?? 'Unknown location';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <Button type="button" variant="ghost" className="w-fit gap-2 px-0" onClick={onBack}>
            <ArrowLeft className="size-4" aria-hidden />
            Back to checks log
          </Button>
          <div>
            <h2 className="font-heading text-2xl">{label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {location?.lat}, {location?.lon} · {detail?.location?.checkCount ?? 0} checks ·{' '}
              {detail?.historySummary?.observationCount ?? 0} archived observations
            </p>
          </div>
        </div>

        <Button type="button" variant="outline" disabled={isSeeding} onClick={handleSeedDemo}>
          {isSeeding ? 'Seeding demo archive…' : 'Populate demo archive'}
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <AdminPanel
        title="Checks"
        description="Served lookups for this location — trigger, provider, cache outcome, and token cost."
      >
        <HistoryTable
          rows={detail?.checks ?? []}
          columns={[
            {
              key: 'recordedAt',
              label: 'Recorded',
              format: (value) => (value ? new Date(value).toLocaleString('en-GB') : '—'),
            },
            {
              key: 'observedAt',
              label: 'Observed',
              format: (value) => (value ? new Date(value).toLocaleString('en-GB') : '—'),
            },
            {
              key: 'trigger',
              label: 'Trigger',
              format: (value) => labelWeatherCheckTrigger(value),
            },
            { key: 'provider', label: 'Provider', format: (value, row) => value ?? row.source ?? '—' },
            { key: 'cacheOutcome', label: 'Cache' },
            { key: 'tokensUsed', label: 'Tokens' },
            { key: 'temperature', label: 'Temp', format: (value) => formatTemperature(value) },
            { key: 'description', label: 'Conditions' },
          ]}
        />
      </AdminPanel>

      <AdminPanel
        title="Compiled insights"
        description="Calculated from the climate observation archive. Same-time-last-year uses a 7-day window around this date one year ago."
      >
        <AdminLocationInsightGrid insights={detail?.insights} historySummary={detail?.historySummary} />
        {detail?.insights?.hasEnoughDataForPublicInsights ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Enough archive data is available to surface these comparisons on the public city page.
          </p>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            More archive data is needed before these comparisons can appear on the public city page.
          </p>
        )}
      </AdminPanel>

      <AdminPanel
        title="Climate archive"
        description="Deduped weather observations written only on successful upstream fetches (not cache serves)."
      >
        <HistoryTable
          rows={detail?.observations ?? []}
          columns={[
            { key: 'observedAt', label: 'Observed' },
            { key: 'temperature', label: 'Temp', format: (value) => formatTemperature(value) },
            { key: 'humidity', label: 'Humidity', format: (value) => (value == null ? '—' : `${value}%`) },
            { key: 'description', label: 'Conditions' },
          ]}
        />
      </AdminPanel>
    </div>
  );
}

function HistoryTable({ rows, columns }) {
  if (!rows.length) {
    return <p className="text-sm text-muted-foreground">No records yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            {columns.map((column) => (
              <th key={column.key} className="py-2 pr-4 font-medium">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.id ?? row.observedAt ?? row.recordedAt}-${index}`} className="border-b last:border-0">
              {columns.map((column) => {
                const rawValue = row[column.key];
                const value =
                  column.key === 'observedAt' && rawValue && !column.format
                    ? new Date(rawValue).toLocaleString('en-GB')
                    : column.format
                      ? column.format(rawValue, row)
                      : (rawValue ?? '—');

                return (
                  <td key={column.key} className="py-3 pr-4 font-tabular">
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
