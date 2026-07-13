'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AdminPanel } from '@/features/admin/components/AdminPanel';

const BAR_FILL = 'var(--color-text-primary)';
const MUTED = 'var(--color-text-muted)';
const GRID = 'var(--color-border)';

function shortenUrl(url) {
  if (!url) {
    return '(unknown)';
  }

  try {
    const parsed = new URL(url);
    const path = parsed.pathname === '/' ? '' : parsed.pathname;
    return `${parsed.hostname}${path}`.slice(0, 42);
  } catch {
    return String(url).slice(0, 42);
  }
}

function EmptyChart({ label }) {
  return (
    <div className="flex h-52 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function EarningsBarChart({ data, nameKey, currencyCode }) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: MUTED }} />
          <YAxis
            type="category"
            dataKey={nameKey}
            width={120}
            tick={{ fontSize: 10, fill: MUTED }}
          />
          <Tooltip
            formatter={(value) => [
              `${Number(value).toFixed(2)} ${currencyCode || ''}`.trim(),
              'Earnings',
            ]}
          />
          <Bar dataKey="earnings" fill={BAR_FILL} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AdminAdSenseBreakdownCharts({
  topPages,
  platforms,
  countries,
  currencyCode,
  connected,
}) {
  const pageData = (topPages ?? []).map((row) => ({
    ...row,
    label: shortenUrl(row.pageUrl),
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <AdminPanel title="Top pages" description="Earnings by page URL.">
        {connected && pageData.length > 0 ? (
          <EarningsBarChart data={pageData} nameKey="label" currencyCode={currencyCode} />
        ) : (
          <EmptyChart label={connected ? 'No page breakdown yet' : 'Connect Google to load breakdowns'} />
        )}
      </AdminPanel>

      <AdminPanel title="Platform" description="Mobile vs desktop revenue.">
        {connected && platforms?.length > 0 ? (
          <EarningsBarChart data={platforms} nameKey="name" currencyCode={currencyCode} />
        ) : (
          <EmptyChart label={connected ? 'No platform data yet' : 'Connect Google to load breakdowns'} />
        )}
      </AdminPanel>

      <AdminPanel title="Countries" description="Top geographic payouts.">
        {connected && countries?.length > 0 ? (
          <EarningsBarChart data={countries} nameKey="name" currencyCode={currencyCode} />
        ) : (
          <EmptyChart label={connected ? 'No country data yet' : 'Connect Google to load breakdowns'} />
        )}
      </AdminPanel>
    </div>
  );
}
