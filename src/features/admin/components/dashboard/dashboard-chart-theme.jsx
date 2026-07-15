'use client';

export function DashboardEmptyChart({ label }) {
  return (
    <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export const DASHBOARD_CHART = {
  stroke: 'var(--color-text-primary)',
  muted: 'var(--color-text-muted)',
  grid: 'var(--color-border)',
  accent: 'hsl(var(--primary))',
};
