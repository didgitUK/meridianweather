'use client';

import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AdminMetricCard } from '@/features/admin/components/AdminMetricCard';
import { AdminPanel } from '@/features/admin/components/AdminPanel';
import {
  DASHBOARD_CHART,
  DashboardEmptyChart,
} from '@/features/admin/components/dashboard/dashboard-chart-theme';

const PIE_COLORS = [DASHBOARD_CHART.stroke, DASHBOARD_CHART.muted, DASHBOARD_CHART.accent];

function formatUsageStatus(status) {
  if (status === 'hard_block') return 'Hard block';
  if (status === 'soft_block') return 'Soft block';
  if (status === 'warning') return 'Warning';
  return 'Healthy';
}

export function DashboardApiPanel({ usage }) {
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
          throw new Error(payload.message ?? 'Unable to load API analytics');
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
    return <p className="text-sm text-muted-foreground">Loading API use…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  const totals = analytics?.totals ?? {};
  const checksOverTime = analytics?.checksOverTime ?? [];
  const tokensByTrigger = analytics?.tokensByTrigger ?? [];
  const cacheVsUpstream = analytics?.cacheVsUpstream ?? [];
  const liveUsage = analytics?.usage ?? usage;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard
          label="Quota today"
          value={`${liveUsage?.used ?? 0} / ${liveUsage?.dailyLimit ?? 0}`}
          hint={formatUsageStatus(liveUsage?.status)}
          tone={
            liveUsage?.status === 'hard_block' || liveUsage?.status === 'soft_block'
              ? 'danger'
              : liveUsage?.status === 'warning'
                ? 'warning'
                : 'ok'
          }
        />
        <AdminMetricCard label="Checks (14d)" value={totals.checks ?? 0} />
        <AdminMetricCard label="Tokens spent" value={totals.tokensSpent ?? 0} />
        <AdminMetricCard label="Cache hit rate" value={`${totals.cacheHitRate ?? 0}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Checks over time" description="Daily weather lookup volume.">
          {checksOverTime.some((row) => row.total > 0) ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={checksOverTime} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid
                    stroke={DASHBOARD_CHART.grid}
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: DASHBOARD_CHART.muted }}
                    tickMargin={8}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: DASHBOARD_CHART.muted }}
                    width={36}
                    allowDecimals={false}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="total"
                    fill={DASHBOARD_CHART.stroke}
                    radius={[4, 4, 0, 0]}
                    name="Checks"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <DashboardEmptyChart label="No checks yet" />
          )}
        </AdminPanel>

        <AdminPanel title="Cache vs upstream" description="Where weather responses came from.">
          {cacheVsUpstream.some((row) => row.value > 0) ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cacheVsUpstream}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {cacheVsUpstream.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <DashboardEmptyChart label="No cache samples yet" />
          )}
        </AdminPanel>
      </div>

      <AdminPanel title="Tokens by trigger" description="Which product flows spend OpenWeather tokens.">
        {tokensByTrigger.some((row) => row.tokens > 0) ? (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tokensByTrigger}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid
                  stroke={DASHBOARD_CHART.grid}
                  strokeDasharray="3 3"
                  horizontal={false}
                />
                <XAxis type="number" tick={{ fontSize: 11, fill: DASHBOARD_CHART.muted }} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={130}
                  tick={{ fontSize: 11, fill: DASHBOARD_CHART.muted }}
                />
                <Tooltip />
                <Bar
                  dataKey="tokens"
                  fill={DASHBOARD_CHART.accent}
                  radius={[0, 4, 4, 0]}
                  name="Tokens"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <DashboardEmptyChart label="No token spend yet" />
        )}
      </AdminPanel>
    </div>
  );
}
