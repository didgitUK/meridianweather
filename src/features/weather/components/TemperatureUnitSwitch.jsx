'use client';

import { useTranslations } from 'next-intl';
import { TEMPERATURE_UNIT } from '@/constants/temperature-unit';
import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import { cn } from '@/lib/utils';

export function TemperatureUnitSwitch({ className }) {
  const t = useTranslations('Common');
  const { isFahrenheit, setUnit } = useTemperatureUnit();

  return (
    <div
      className={cn(
        'flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-2.5',
        className,
      )}
    >
      <span
        className={cn(
          'text-xs font-medium tabular-nums',
          !isFahrenheit ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        °C
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isFahrenheit}
        aria-label={isFahrenheit ? t('switchToCelsius') : t('switchToFahrenheit')}
        onClick={() => setUnit(
          isFahrenheit ? TEMPERATURE_UNIT.CELSIUS : TEMPERATURE_UNIT.FAHRENHEIT,
        )}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors',
          'hover:opacity-90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          'active:opacity-80 disabled:pointer-events-none disabled:opacity-50',
          isFahrenheit
            ? 'border-foreground bg-foreground'
            : 'border-foreground/40 bg-muted',
        )}
      >
        <span
          className={cn(
            'pointer-events-none absolute top-0.5 left-0.5 block size-5 rounded-full shadow-sm transition-transform',
            isFahrenheit
              ? 'bg-background'
              : 'bg-foreground',
            isFahrenheit && 'translate-x-5',
          )}
        />
      </button>
      <span
        className={cn(
          'text-xs font-medium tabular-nums',
          isFahrenheit ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        °F
      </span>
    </div>
  );
}
