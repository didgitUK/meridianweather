'use client';

import { ADSENSE_REPORT_RANGES } from '@/constants/adsense-reports';
import { AdminPanel } from '@/features/admin/components/AdminPanel';
import { cn } from '@/lib/utils';

export function AdminAdSenseEarningsHero({
  rangeId,
  onRangeChange,
  formattedEarnings,
  connected,
  note,
}) {
  return (
    <AdminPanel
      title="What you’ve earned"
      description="Estimated AdSense revenue for the selected period. This is how Meridian funds free access."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated earnings</p>
          <p className="mt-2 font-heading text-4xl font-medium tabular-nums text-foreground sm:text-5xl">
            {connected ? formattedEarnings ?? '—' : '—'}
          </p>
          {note ? <p className="mt-2 text-xs text-muted-foreground">{note}</p> : null}
        </div>

        <div className="flex flex-wrap gap-1 rounded-lg border border-border p-1" role="group" aria-label="Report range">
          {Object.values(ADSENSE_REPORT_RANGES).map((range) => {
            const active = range.id === rangeId;

            return (
              <button
                key={range.id}
                type="button"
                onClick={() => onRangeChange(range.id)}
                disabled={!connected}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  !connected ? 'opacity-50' : null,
                )}
                aria-pressed={active}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>
    </AdminPanel>
  );
}
