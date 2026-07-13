'use client';

import {
  formatDayLabel,
  formatHourLabel,
  formatPop,
  formatPrecipMm,
  formatWind,
} from '@/features/weather/utils/forecast-formatters';
import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import { WeatherIcon } from '@/features/weather/components/WeatherIcon';

export function HourlyForecastChart({ points, timezone }) {
  const { formatTemp } = useTemperatureUnit();
  if (points.length === 0) return null;

  return (
    <section className="rounded-xl border bg-card p-4">
      <h2 className="font-heading text-xl">Hourly forecast</h2>
      <p className="mt-1 text-sm text-muted-foreground">Up to 48 hours of temperature, wind, and precipitation.</p>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {points.map((point) => (
          <div key={point.dt} className="min-w-28 flex flex-col items-center gap-1 text-center">
            <span className="text-xs text-muted-foreground">{formatHourLabel(point.dt, timezone)}</span>
            {point.icon ? (
              <WeatherIcon icon={point.icon} alt={point.description ?? ''} size={28} />
            ) : null}
            <span className="font-tabular text-sm">{formatTemp(point.temp)}</span>
            {point.feelsLike != null ? (
              <span className="text-xs text-muted-foreground">
                Feels {formatTemp(point.feelsLike)}
              </span>
            ) : null}
            {formatPop(point.pop) ? (
              <span className="text-xs text-muted-foreground">{formatPop(point.pop)} rain</span>
            ) : null}
            {point.rain1h != null ? (
              <span className="text-xs text-muted-foreground">Rain {formatPrecipMm(point.rain1h)}</span>
            ) : null}
            {point.snow1h != null ? (
              <span className="text-xs text-muted-foreground">Snow {formatPrecipMm(point.snow1h)}</span>
            ) : null}
            {point.windSpeedKmh != null ? (
              <span className="text-xs text-muted-foreground">
                {formatWind(point.windSpeedKmh, point.windDeg)}
              </span>
            ) : null}
            {point.windGustKmh != null ? (
              <span className="text-xs text-muted-foreground">Gust {point.windGustKmh} km/h</span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
