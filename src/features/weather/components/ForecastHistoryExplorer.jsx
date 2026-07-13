'use client';

import { ForecastDayCarousel } from '@/features/weather/components/forecast-explorer/ForecastDayCarousel';
import { ForecastDayPanel } from '@/features/weather/components/forecast-explorer/ForecastDayPanel';

export function ForecastHistoryExplorer({
  dayEntries,
  activeDay,
  chartPoints,
  isForecastDay,
  activeObservations,
  isLoading,
  error,
  timezone,
  timezoneOffset = null,
}) {
  return (
    <section className="rounded-xl border bg-card p-4 sm:p-6">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading stored history…</p>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {activeDay ? (
        <ForecastDayPanel
          chartPoints={chartPoints}
          observations={activeObservations}
          timezone={timezone}
          timezoneOffset={timezoneOffset}
          isForecastDay={isForecastDay}
        />
      ) : dayEntries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Forecast data is not available yet.</p>
      ) : null}
    </section>
  );
}

export { ForecastDayCarousel };
export { HeroForecastCarousel } from '@/features/weather/components/forecast-explorer/HeroForecastCarousel';
