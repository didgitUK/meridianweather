'use client';

import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { buildConsecutiveDailyRows } from '@/features/weather/utils/forecast-formatters';
import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import { WeatherIcon } from '@/features/weather/components/WeatherIcon';

export function DailyForecastStrip({
  forecast,
  timezone = null,
  timezoneOffset = null,
  loading,
  error,
  days = 7,
}) {
  const t = useTranslations('Dashboard.weatherCard');
  const { formatTempRange } = useTemperatureUnit();
  if (loading) {
    return (
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: days }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-xs text-muted-foreground">{t('dailyUnavailable')}</p>;
  }

  const offset = timezoneOffset ?? forecast?.timezoneOffset ?? null;
  const zone = timezone ?? forecast?.timezone ?? null;
  const rows = buildConsecutiveDailyRows(forecast?.points ?? [], {
    count: days,
    timezone: zone,
    timezoneOffset: offset,
  });

  if (rows.length === 0) {
    return <p className="text-xs text-muted-foreground">{t('dailyUnavailable')}</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      {rows.map((row) => {
        const point = row.point;
        const tempLabel = point
          ? formatTempRange(point.tempMin ?? point.temp, point.tempMax ?? point.temp)
          : '—';

        return (
          <div
            key={row.dateKey}
            className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-2 py-1.5"
          >
            {point?.icon ? (
              <WeatherIcon icon={point.icon} alt={point.description ?? ''} size={24} />
            ) : (
              <span className="size-6 shrink-0 rounded-xl bg-muted" aria-hidden />
            )}
            <span className="min-w-0 text-xs leading-tight">
              <span className="font-medium text-foreground">{row.weekday}</span>
              <span className="mt-0.5 block text-muted-foreground">
                {row.dayMonth} {row.year}
              </span>
            </span>
            <span className="ml-auto shrink-0 font-tabular text-xs font-medium leading-none">
              {tempLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}
