'use client';

import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AdminPanel } from '@/features/admin/components/AdminPanel';
import { AdminMetricCard } from '@/features/admin/components/AdminMetricCard';
import { labelWeatherCheckTrigger } from '@/constants/weather-check-triggers';

const CHART_STROKE = 'var(--color-text-primary)';
const MUTED_STROKE = 'var(--color-text-muted)';
const GRID = 'var(--color-border)';
const PIE_COLORS = [
  'var(--color-text-primary)',
  'var(--color-text-muted)',
  'hsl(var(--primary))',
  'hsl(var(--chart-2, 173 58% 39%))',
  'hsl(var(--chart-3, 197 37% 24%))',
  'hsl(var(--chart-4, 43 74% 66%))',
];

function EmptyChart({ label }) {
  return (
    <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export function ChecksLogOverview() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch('/api/admin/checks?view=analytics&days=14');
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message ?? 'Unable to load checks analytics');
        }

        if (!cancelled) {
          setAnalytics(payload);
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
  }, []);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading checks overview…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  const totals = analytics?.totals ?? {};
  const checksOverTime = analytics?.checksOverTime ?? [];
  const tokensByTrigger = analytics?.tokensByTrigger ?? [];
  const cacheVsUpstream = analytics?.cacheVsUpstream ?? [];
  const topLocations = analytics?.topLocations ?? [];
  const recentCalls = analytics?.usage?.recentCalls ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard label="Checks (14d)" value={totals.checks ?? 0} />
        <AdminMetricCard label="Tokens spent" value={totals.tokensSpent ?? 0} />
        <AdminMetricCard label="Cache hit rate" value={`${totals.cacheHitRate ?? 0}%`} />
        <AdminMetricCard
          label="Quota today"
          value={`${analytics?.usage?.used ?? 0} / ${analytics?.usage?.dailyLimit ?? 0}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Checks over time" description="Daily check volume for the last 14 days.">
          {checksOverTime.some((row) => row.total > 0) ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={checksOverTime} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: MUTED_STROKE }} tickMargin={8} />
                  <YAxis tick={{ fontSize: 11, fill: MUTED_STROKE }} width={36} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill={CHART_STROKE} radius={[4, 4, 0, 0]} name="Checks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="No checks recorded in this window." />
          )}
        </AdminPanel>

        <AdminPanel title="Tokens by trigger" description="Where OpenWeather tokens are being spent.">
          {tokensByTrigger.length ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tokensByTrigger}
                  layout="vertical"
                  margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                >
                  <CartesianGrid stroke={GRID} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: MUTED_STROKE }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={130}
                    tick={{ fontSize: 11, fill: MUTED_STROKE }}
                  />
                  <Tooltip />
                  <Bar dataKey="tokens" fill={CHART_STROKE} radius={[0, 4, 4, 0]} name="Tokens" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="No token-spending checks yet." />
          )}
        </AdminPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Cache vs upstream" description="How often checks were served without spending a token.">
          {cacheVsUpstream.some((row) => row.value > 0) ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cacheVsUpstream}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {cacheVsUpstream.map((entry, index) => (
                      <Cell key={entry.key} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="No cache outcome data yet." />
          )}
        </AdminPanel>

        <AdminPanel title="Top locations by tokens" description="Locations that drove the most upstream spend.">
          {topLocations.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Location</th>
                    <th className="py-2 pr-4 font-medium">Checks</th>
                    <th className="py-2 font-medium">Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {topLocations.map((location) => (
                    <tr key={location.locationId} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        {location.label}
                        {location.country ? ` (${location.country})` : ''}
                      </td>
                      <td className="py-3 pr-4 font-tabular">{location.checks}</td>
                      <td className="py-3 font-tabular">{location.tokens}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No location spend yet.</p>
          )}
        </AdminPanel>
      </div>

      <AdminPanel title="Recent API calls" description="Latest rows from the usage log, including trigger metadata when present.">
        {recentCalls.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
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
                {recentCalls.map((call) => (
                  <tr key={call.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-tabular">
                      {call.timestamp ? new Date(call.timestamp).toLocaleString('en-GB') : '—'}
                    </td>
                    <td className="py-3 pr-4">{call.endpoint}</td>
                    <td className="py-3 pr-4">{call.status}</td>
                    <td className="py-3 pr-4">
                      {call.meta?.trigger
                        ? labelWeatherCheckTrigger(call.meta.trigger)
                        : call.meta?.reason
                          ? call.meta.reason
                          : '—'}
                    </td>
                    <td className="py-3">{call.cacheHit ? 'hit' : 'miss'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No recent API calls logged.</p>
        )}
      </AdminPanel>
    </div>
  );
}
