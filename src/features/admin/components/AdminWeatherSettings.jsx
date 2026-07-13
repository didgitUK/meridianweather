'use client';

import { Input } from '@/components/ui/input';
import { AdminField, AdminPanel } from '@/features/admin/components/AdminPanel';
import { AdminOpenWeatherKeyField } from '@/features/admin/components/AdminOpenWeatherKeyField';
import { useDebouncedAdminSave } from '@/features/admin/hooks/useDebouncedAdminSave';

export function AdminUsagePanel({ usage, onRefresh }) {
  if (!usage) {
    return null;
  }

  const endpointBreakdown = Object.entries(usage.breakdown ?? {}).filter(
    ([key]) => !['blocked', 'cacheHits'].includes(key),
  );

  return (
    <AdminPanel title="API usage today" description="OpenWeather upstream calls tracked in the database for this server.">
      <div className="grid gap-3 sm:grid-cols-4">
        <Metric label="Used" value={`${usage.used} / ${usage.dailyLimit}`} />
        <Metric label="Remaining" value={usage.remaining} />
        <Metric label="Status" value={usage.status} />
        <Metric label="Cache hits" value={usage.breakdown?.cacheHits ?? 0} />
      </div>
      {endpointBreakdown.length ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {endpointBreakdown.map(([endpoint, count]) => (
            <Metric key={endpoint} label={endpoint} value={count} />
          ))}
        </div>
      ) : null}
      {Array.isArray(usage.recentCalls) && usage.recentCalls.length ? (
        <div className="mt-4 overflow-x-auto">
          <p className="mb-2 text-xs text-muted-foreground">Recent calls</p>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Time</th>
                <th className="py-2 pr-4 font-medium">Endpoint</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Trigger</th>
                <th className="py-2 font-medium">Cache</th>
              </tr>
            </thead>
            <tbody>
              {usage.recentCalls.slice(0, 20).map((call) => (
                <tr key={call.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-tabular">
                    {call.timestamp ? new Date(call.timestamp).toLocaleString('en-GB') : '—'}
                  </td>
                  <td className="py-2 pr-4">{call.endpoint}</td>
                  <td className="py-2 pr-4">{call.status}</td>
                  <td className="py-2 pr-4">{call.meta?.trigger ?? '—'}</td>
                  <td className="py-2">{call.cacheHit ? 'hit' : 'miss'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <button type="button" className="mt-4 text-sm underline" onClick={onRefresh}>
        Refresh usage
      </button>
    </AdminPanel>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border bg-muted/20 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-tabular text-sm">{value}</p>
    </div>
  );
}

export function AdminWeatherSettings({ settings, refreshOptions, onUpdated, onRefresh }) {
  const { save, isSaving, error } = useDebouncedAdminSave(onUpdated);

  if (!settings) {
    return null;
  }

  return (
    <AdminPanel
      title="Weather API"
      description="Quota, cache timing, and OpenWeather credentials. Changes save automatically."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Refresh interval">
          <select
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
            value={settings.refreshIntervalMs}
            onChange={(event) => save({ refreshIntervalMs: Number(event.target.value) })}
          >
            {refreshOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </AdminField>

        <AdminField label="Stale cache max (ms)">
          <Input
            type="number"
            value={settings.staleCacheMaxMs}
            onChange={(event) => save({ staleCacheMaxMs: Number(event.target.value) })}
          />
        </AdminField>

        <AdminField label="Daily API limit">
          <Input
            type="number"
            value={settings.dailyLimit}
            onChange={(event) => save({ dailyLimit: Number(event.target.value) })}
          />
        </AdminField>

        <AdminField label="Soft block threshold">
          <Input
            type="number"
            value={settings.softBlockThreshold}
            onChange={(event) => save({ softBlockThreshold: Number(event.target.value) })}
          />
        </AdminField>

        <AdminField label="Warning threshold">
          <Input
            type="number"
            value={settings.warningThreshold}
            onChange={(event) => save({ warningThreshold: Number(event.target.value) })}
          />
        </AdminField>

        <AdminField label="Per-minute limit">
          <Input
            type="number"
            value={settings.perMinuteLimit}
            onChange={(event) => save({ perMinuteLimit: Number(event.target.value) })}
          />
        </AdminField>

        <AdminOpenWeatherKeyField
          settings={settings}
          onSave={save}
          isSaving={isSaving}
          onRevealed={onRefresh}
        />
      </div>

      {isSaving ? <p className="mt-3 text-xs text-muted-foreground">Saving…</p> : null}
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </AdminPanel>
  );
}
