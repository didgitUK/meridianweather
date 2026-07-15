'use client';

import { useEffect, useMemo, useState } from 'react';
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

const PIE_COLORS = [
  DASHBOARD_CHART.stroke,
  DASHBOARD_CHART.accent,
  DASHBOARD_CHART.muted,
  'hsl(var(--chart-4, 43 74% 66%))',
  'hsl(var(--chart-5, 27 87% 67%))',
];

export function DashboardEmailListsPanel() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch('/api/admin/mailing-summary');
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message ?? 'Unable to load mailing list summary');
        }

        if (!cancelled) {
          setSummary(payload.summary ?? null);
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

  const alertTypeCounts = summary?.alertTypeCounts ?? [];

  const byList = useMemo(() => {
    const newsletterActive = summary?.newsletterActive ?? 0;
    const weeklyActive = summary?.weeklyActive ?? 0;
    const rows = [
      { name: 'Newsletter', value: newsletterActive },
      { name: 'Weekly digests', value: weeklyActive },
      ...alertTypeCounts
        .filter((entry) => entry.count > 0)
        .map((entry) => ({
          name: entry.shortLabel ?? entry.label,
          value: entry.count,
        })),
    ];
    return rows.filter((row) => row.value > 0);
  }, [summary, alertTypeCounts]);

  const barRows = useMemo(() => {
    const newsletterActive = summary?.newsletterActive ?? 0;
    const newsletterInactive = summary?.newsletterInactive ?? 0;
    const weeklyActive = summary?.weeklyActive ?? 0;

    return [
      { label: 'Newsletter active', count: newsletterActive },
      { label: 'Newsletter inactive', count: newsletterInactive },
      { label: 'Weekly digests', count: weeklyActive },
      ...alertTypeCounts.map((entry) => ({
        label: entry.shortLabel ?? entry.label,
        count: entry.count,
      })),
    ];
  }, [summary, alertTypeCounts]);

  const alertBarHeight = Math.max(224, alertTypeCounts.length * 22 + 96);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading email lists…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  const newsletterActive = summary?.newsletterActive ?? 0;
  const weeklyActive = summary?.weeklyActive ?? 0;
  const alertsActive = summary?.alertsActive ?? 0;
  const total = summary?.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard label="Total records" value={total} />
        <AdminMetricCard label="Newsletter" value={newsletterActive} />
        <AdminMetricCard label="Weekly digests" value={weeklyActive} />
        <AdminMetricCard label="Location alerts" value={alertsActive} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel
          title="Active lists"
          description="Newsletter, digests, and each location alert type with active subscribers."
        >
          {byList.length ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byList}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {byList.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <DashboardEmptyChart label="No active subscribers yet" />
          )}
        </AdminPanel>

        <AdminPanel
          title="List roster sizes"
          description="Every mailing list and location alert type — not a single alerts bucket."
        >
          {barRows.some((row) => row.count > 0) ? (
            <div className="w-full overflow-y-auto" style={{ height: Math.min(alertBarHeight, 420) }}>
              <div style={{ height: alertBarHeight, minHeight: 224 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barRows}
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
                      width={120}
                      tick={{ fontSize: 11, fill: DASHBOARD_CHART.muted }}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill={DASHBOARD_CHART.stroke}
                      radius={[0, 4, 4, 0]}
                      name="Subscribers"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <DashboardEmptyChart label="No mailing list data yet" />
          )}
        </AdminPanel>
      </div>
    </div>
  );
}
