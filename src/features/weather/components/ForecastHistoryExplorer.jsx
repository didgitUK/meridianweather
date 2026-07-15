'use client';

import { useTranslations } from 'next-intl';
import { ForecastDayCarousel } from '@/features/weather/components/forecast-explorer/ForecastDayCarousel';
import { ForecastDayPanel } from '@/features/weather/components/forecast-explorer/ForecastDayPanel';

export function ForecastHistoryExplorer({
  dayEntries,
  activeDay,
  activeDateKey,
  chartPoints,
  isForecastDay,
  activeObservations,
  isLoading,
  error,
  timezone,
  timezoneOffset = null,
  onSelectDay,
  todayKey,
}) {
  const t = useTranslations('CityDetail.history');
  const historyDays = dayEntries.filter(
    (day) => !day.isEmpty && todayKey && day.dateKey && day.dateKey <= todayKey,
  );

  return (
    <section className="rounded-xl border bg-card p-4 sm:p-6">
      <h2 className="font-heading text-xl">{t('title')}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('description')}
      </p>

      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">{t('loading')}</p>
      ) : null}

      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}

      {historyDays.length > 0 && onSelectDay ? (
        <div className="mt-4">
          <ForecastDayCarousel
            days={historyDays}
            selectedDateKey={activeDateKey}
            onSelectDay={onSelectDay}
            scrollable
          />
        </div>
      ) : null}

      <div className="mt-4">
        {activeDay ? (
          <ForecastDayPanel
            chartPoints={chartPoints}
            observations={activeObservations}
            timezone={timezone}
            timezoneOffset={timezoneOffset}
            isForecastDay={isForecastDay}
          />
        ) : dayEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noData')}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t('noEntries')}
          </p>
        )}
      </div>
    </section>
  );
}

export { ForecastDayCarousel };
export { HeroForecastCarousel } from '@/features/weather/components/forecast-explorer/HeroForecastCarousel';
