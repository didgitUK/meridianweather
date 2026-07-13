'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { formatDayLabel } from '@/features/weather/utils/forecast-formatters';
import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import { WeatherIcon } from '@/features/weather/components/WeatherIcon';

export function DailyForecastStrip({ forecast, timezone, loading, error, days = 7 }) {
  const { formatTempRange } = useTemperatureUnit();
  if (loading) {
    return (
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: days }).map((_, index) => (
          <Skeleton key={index} className="h-[4.75rem] min-w-[4.25rem] shrink-0 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-xs text-muted-foreground">Daily forecast unavailable.</p>;
  }

  const points = forecast?.points?.slice(0, days) ?? [];
  if (points.length === 0) {
    return <p className="text-xs text-muted-foreground">Daily forecast unavailable.</p>;
  }

  return (
    <div className="meridian-scrollbar flex gap-2 overflow-x-auto pb-1">
      {points.map((point) => (
        <div
          key={point.dt}
          className="flex min-w-[3.75rem] shrink-0 flex-col items-center gap-1 rounded-lg border bg-muted/30 p-1.5 text-center sm:min-w-[4.25rem] sm:p-2"
        >
          <span className="text-xs text-muted-foreground">{formatDayLabel(point.dt, timezone)}</span>
          {point.icon ? (
            <WeatherIcon icon={point.icon} alt={point.description ?? ''} size={28} />
          ) : (
            <span className="size-7" aria-hidden />
          )}
          <span className="font-tabular text-xs leading-none">
            {formatTempRange(point.tempMin ?? point.temp, point.tempMax ?? point.temp)}
          </span>
        </div>
      ))}
    </div>
  );
}
