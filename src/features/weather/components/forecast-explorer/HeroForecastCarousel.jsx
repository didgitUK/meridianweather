'use client';

import { useMemo } from 'react';
import { ForecastDayCarousel } from '@/features/weather/components/forecast-explorer/ForecastDayCarousel';
import { ForecastRangeTabs } from '@/features/weather/components/forecast-explorer/ForecastRangeTabs';
import { filterDayEntriesByRange } from '@/features/weather/utils/forecast-explorer';
import { TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

export function HeroForecastCarousel({
  days,
  todayKey,
  timezone,
  timezoneOffset = null,
  selectedDateKey,
  onSelectDay,
  range,
  onRangeChange,
}) {
  const visibleDays = useMemo(
    () => filterDayEntriesByRange(days, todayKey, range, timezone, timezoneOffset),
    [days, range, todayKey, timezone, timezoneOffset],
  );

  function handleRangeChange(nextRange) {
    onRangeChange(nextRange);

    const nextVisibleDays = filterDayEntriesByRange(days, todayKey, nextRange, timezone, timezoneOffset);
    const selectionStillVisible = nextVisibleDays.some((day) => day.dateKey === selectedDateKey);

    if (!selectionStillVisible) {
      const fallbackDay =
        nextVisibleDays.find((day) => day.dateKey === todayKey) ?? nextVisibleDays[0] ?? null;

      if (fallbackDay) {
        onSelectDay(fallbackDay.dateKey);
      }
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className={cn(TYPOGRAPHY.heading, 'text-xl')}>Forecast</h2>
        <ForecastRangeTabs value={range} onChange={handleRangeChange} />
      </div>
      <ForecastDayCarousel
        days={visibleDays}
        selectedDateKey={selectedDateKey}
        onSelectDay={onSelectDay}
        compact={range === 'month'}
        scrollable={range === 'month'}
      />
    </div>
  );
}
