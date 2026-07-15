'use client';

import { useEffect, useState } from 'react';
import {
  WEATHER_CHECK_TRIGGER_VALUES,
  labelWeatherCheckTrigger,
} from '@/constants/weather-check-triggers';
import { Button } from '@/components/ui/button';
import { AdminPanel } from '@/features/admin/components/AdminPanel';
import { formatTemperature } from '@/features/weather/utils/formatWeather';

const PAGE_SIZE = 50;

export function ChecksLogTable({ onSelectLocation }) {
  const [checks, setChecks] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [trigger, setTrigger] = useState('all');
  const [upstreamOnly, setUpstreamOnly] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError('');

      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: String(offset),
        });

        if (trigger !== 'all') {
          params.set('trigger', trigger);
        }
        if (upstreamOnly) {
          params.set('upstreamOnly', '1');
        }

        const response = await fetch(`/api/admin/checks?${params.toString()}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message ?? 'Unable to load checks');
        }

        if (!cancelled) {
          setChecks(payload.checks ?? []);
          setTotal(payload.total ?? 0);
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

    load();
    return () => {
      cancelled = true;
    };
  }, [offset, trigger, upstreamOnly]);

  const canPrev = offset > 0;
  const canNext = offset + PAGE_SIZE < total;

  return (
    <AdminPanel
      title="All checks"
      description="Upstream current-weather lookups (OpenWeather spend). Cache serves are not logged as checks."
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Trigger
            <select
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              value={trigger}
              onChange={(event) => {
                setOffset(0);
                setTrigger(event.target.value);
              }}
            >
              <option value="all">All triggers</option>
              {WEATHER_CHECK_TRIGGER_VALUES.map((value) => (
                <option key={value} value={value}>
                  {labelWeatherCheckTrigger(value)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <input
              type="checkbox"
              checked={upstreamOnly}
              onChange={(event) => {
                setOffset(0);
                setUpstreamOnly(event.target.checked);
              }}
            />
            Upstream only (tokens &gt; 0)
          </label>
        </div>

        <p className="text-sm text-muted-foreground">
          {total} check{total === 1 ? '' : 's'}
        </p>
      </div>

      {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading checks…</p>
      ) : checks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No checks match these filters.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Recorded</th>
                <th className="py-2 pr-4 font-medium">Location</th>
                <th className="py-2 pr-4 font-medium">Trigger</th>
                <th className="py-2 pr-4 font-medium">Provider</th>
                <th className="py-2 pr-4 font-medium">Cache</th>
                <th className="py-2 pr-4 font-medium">Tokens</th>
                <th className="py-2 pr-4 font-medium">Temp</th>
                <th className="py-2 font-medium">Conditions</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((check) => (
                <tr key={check.id ?? `${check.recordedAt}-${check.locationId}`} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-tabular">
                    {check.recordedAt
                      ? new Date(check.recordedAt).toLocaleString('en-GB')
                      : '—'}
                  </td>
                  <td className="py-3 pr-4">
                    {typeof onSelectLocation === 'function' ? (
                      <button
                        type="button"
                        className="text-left underline-offset-2 hover:underline"
                        onClick={() => onSelectLocation(check.locationId)}
                      >
                        {check.label ?? check.cityName ?? 'Unknown'}
                      </button>
                    ) : (
                      (check.label ?? check.cityName ?? 'Unknown')
                    )}
                  </td>
                  <td className="py-3 pr-4">{labelWeatherCheckTrigger(check.trigger)}</td>
                  <td className="py-3 pr-4">{check.provider ?? check.source ?? '—'}</td>
                  <td className="py-3 pr-4">{check.cacheOutcome ?? '—'}</td>
                  <td className="py-3 pr-4 font-tabular">{check.tokensUsed ?? 0}</td>
                  <td className="py-3 pr-4 font-tabular">{formatTemperature(check.temperature)}</td>
                  <td className="py-3">{check.description ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canPrev || isLoading}
          onClick={() => setOffset((current) => Math.max(0, current - PAGE_SIZE))}
        >
          Previous
        </Button>
        <p className="text-xs text-muted-foreground">
          {total === 0 ? '0' : `${offset + 1}–${Math.min(offset + PAGE_SIZE, total)}`} of {total}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canNext || isLoading}
          onClick={() => setOffset((current) => current + PAGE_SIZE)}
        >
          Next
        </Button>
      </div>
    </AdminPanel>
  );
}
