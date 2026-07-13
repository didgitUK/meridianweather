'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { TOUCH } from '@/constants/design-tokens';
import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import { formatPop } from '@/features/weather/utils/forecast-formatters';
import { WeatherIcon } from '@/features/weather/components/WeatherIcon';

export function ForecastDayCarousel({
  days,
  selectedDateKey,
  onSelectDay,
  compact = false,
  scrollable = false,
}) {
  const { formatTempRange: formatTempRangeWithUnit } = useTemperatureUnit();
  const selectedRef = useRef(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [selectedDateKey]);

  if (days.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Forecast data is not available yet.</p>
    );
  }

  return (
    <div
      className={cn(
        '-mx-1 flex gap-2 px-1 pb-2 snap-x snap-mandatory',
        scrollable
          ? 'meridian-scrollbar overflow-x-auto'
          : 'overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
      )}
    >
      {days.map((day) => {
        const isSelected = day.dateKey === selectedDateKey;
        const isEmpty = day.isEmpty === true;

        return (
          <button
            key={day.dateKey}
            ref={isSelected ? selectedRef : null}
            type="button"
            onClick={() => onSelectDay(day.dateKey)}
            className={cn(
              'flex shrink-0 snap-center flex-col items-center justify-center gap-1.5 rounded-2xl border text-center transition-colors sm:gap-2',
              TOUCH.minH,
              compact ? 'min-w-[4rem] px-1.5 py-2 sm:min-w-[4.25rem] sm:px-2' : 'min-w-[4.75rem] px-2 py-2.5 sm:min-w-[5.5rem] sm:px-3 sm:py-3',
              isSelected
                ? 'border-primary/40 bg-muted shadow-sm'
                : 'border-transparent bg-muted/20 hover:bg-muted/40',
              isEmpty && !isSelected && 'opacity-60',
            )}
            aria-pressed={isSelected}
          >
            <span className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>{day.dayLabel}</span>
            {day.icon ? (
              <WeatherIcon icon={day.icon} alt={day.description ?? ''} size={compact ? 28 : 36} />
            ) : (
              <span className="size-9" aria-hidden />
            )}
            <span className="font-tabular text-sm leading-none">
              {formatTempRangeWithUnit(day.tempMin, day.tempMax)}
            </span>
            {formatPop(day.pop) ? (
              <span className="text-xs text-muted-foreground">{formatPop(day.pop)}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
