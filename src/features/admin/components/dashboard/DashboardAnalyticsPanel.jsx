'use client';

import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
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

export function DashboardAnalyticsPanel() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch('/api/admin/analytics?days=14');
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message ?? 'Unable to load site analytics');
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
    return <p className="text-sm text-muted-foreground">Loading analytics…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  const totals = analytics?.totals ?? {};
  const trafficOverTime = analytics?.trafficOverTime ?? [];
  const topPaths = analytics?.topPaths ?? [];
  const adViewsBySlot = analytics?.adViewsBySlot ?? [];
  const scrollDepth = analytics?.scrollDepth ?? [];
  const hasTraffic = trafficOverTime.some((row) => row.pageviews > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <AdminMetricCard label="Sessions (14d)" value={totals.sessions ?? 0} />
        <AdminMetricCard label="Pageviews" value={totals.pageviews ?? 0} />
        <AdminMetricCard
          label="Avg time on page"
          value={`${totals.avgEngagementSeconds ?? 0}s`}
        />
        <AdminMetricCard
          label="Avg scroll depth"
          value={`${totals.avgScrollDepthPct ?? 0}%`}
        />
        <AdminMetricCard label="Ad area views" value={totals.adViews ?? 0} />
      </div>

      {!hasTraffic ? (
        <AdminPanel
          title="Waiting for traffic"
          description="First-party analytics start collecting as visitors browse the public site (admin pages are excluded)."
        >
          <p className="text-sm text-muted-foreground">
            Open the home page or a city page in another tab, then refresh this dashboard to see
            sessions, scroll depth, and ad placement views.
          </p>
        </AdminPanel>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Traffic over time" description="Daily pageviews and sessions.">
          {hasTraffic ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficOverTime} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
                    dataKey="pageviews"
                    fill={DASHBOARD_CHART.stroke}
                    radius={[4, 4, 0, 0]}
                    name="Pageviews"
                  />
                  <Bar
                    dataKey="sessions"
                    fill={DASHBOARD_CHART.accent}
                    radius={[4, 4, 0, 0]}
                    name="Sessions"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <DashboardEmptyChart label="No pageviews yet" />
          )}
        </AdminPanel>

        <AdminPanel title="Scroll depth" description="How far visitors scroll before leaving.">
          {scrollDepth.some((row) => row.count > 0) ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scrollDepth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid
                    stroke={DASHBOARD_CHART.grid}
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
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
                    dataKey="count"
                    fill={DASHBOARD_CHART.stroke}
                    radius={[4, 4, 0, 0]}
                    name="Visits"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <DashboardEmptyChart label="No scroll samples yet" />
          )}
        </AdminPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Top paths" description="Most viewed public routes.">
          {topPaths.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Path</th>
                    <th className="py-2 font-medium">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {topPaths.map((row) => (
                    <tr key={row.path} className="border-b last:border-0">
                      <td className="py-2.5 pr-4 font-mono text-xs">{row.path}</td>
                      <td className="py-2.5 font-tabular">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <DashboardEmptyChart label="No paths yet" />
          )}
        </AdminPanel>

        <AdminPanel
          title="Ad area views"
          description="How often each ad placement entered the viewport (≥40% visible)."
        >
          {adViewsBySlot.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={adViewsBySlot}
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
                    dataKey="slotId"
                    width={96}
                    tick={{ fontSize: 11, fill: DASHBOARD_CHART.muted }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill={DASHBOARD_CHART.accent}
                    radius={[0, 4, 4, 0]}
                    name="Views"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <DashboardEmptyChart label="No ad area views yet" />
          )}
        </AdminPanel>
      </div>
    </div>
  );
}
