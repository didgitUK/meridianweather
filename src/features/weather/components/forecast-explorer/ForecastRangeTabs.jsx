'use client';

import { cn } from '@/lib/utils';
import { TOUCH } from '@/constants/design-tokens';

const RANGE_OPTIONS = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

export function ForecastRangeTabs({ value, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Forecast range"
      className="inline-flex rounded-lg border border-border/80 bg-muted/30 p-1"
    >
      {RANGE_OPTIONS.map((option) => {
        const isActive = option.id === value;

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors sm:py-1.5',
              TOUCH.minH,
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
