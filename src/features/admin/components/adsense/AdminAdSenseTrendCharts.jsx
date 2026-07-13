'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AdminPanel } from '@/features/admin/components/AdminPanel';

const CHART_STROKE = 'var(--color-text-primary)';
const MUTED_STROKE = 'var(--color-text-muted)';
const GRID = 'var(--color-border)';

function EmptyChart({ label }) {
  return (
    <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export function AdminAdSenseTrendCharts({ series, currencyCode, connected }) {
  const hasData = connected && Array.isArray(series) && series.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AdminPanel title="Earnings over time" description="Daily estimated earnings.">
        {hasData ? (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="adsenseEarningsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_STROKE} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={CHART_STROKE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: MUTED_STROKE }} tickMargin={8} />
                <YAxis
                  tick={{ fontSize: 11, fill: MUTED_STROKE }}
                  width={48}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toFixed(2)} ${currencyCode || ''}`.trim(),
                    'Earnings',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke={CHART_STROKE}
                  fill="url(#adsenseEarningsFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart label={connected ? 'No earnings data for this range' : 'Connect Google to load charts'} />
        )}
      </AdminPanel>

      <AdminPanel title="Traffic over time" description="Impressions and clicks by day.">
        {hasData ? (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: MUTED_STROKE }} tickMargin={8} />
                <YAxis tick={{ fontSize: 11, fill: MUTED_STROKE }} width={48} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="impressions"
                  name="Impressions"
                  stroke={MUTED_STROKE}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  name="Clicks"
                  stroke={CHART_STROKE}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart label={connected ? 'No traffic data for this range' : 'Connect Google to load charts'} />
        )}
      </AdminPanel>
    </div>
  );
}
