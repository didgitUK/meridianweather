'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { TOUCH } from '@/constants/design-tokens';

const RANGE_IDS = ['week', 'month'];

export function ForecastRangeTabs({ value, onChange }) {
  const t = useTranslations('Forecast.range');

  return (
    <div
      role="tablist"
      aria-label={t('label')}
      className="inline-flex rounded-lg border border-border/80 bg-muted/30 p-1"
    >
      {RANGE_IDS.map((id) => {
        const isActive = id === value;

        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors sm:py-1.5',
              TOUCH.minH,
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t(id)}
          </button>
        );
      })}
    </div>
  );
}
