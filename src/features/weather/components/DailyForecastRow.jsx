'use client';

import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import {
  formatDayLabel,
  formatMoonPhase,
  formatPop,
  formatPrecipMm,
  formatUvi,
  formatWind,
} from '@/features/weather/utils/forecast-formatters';
import { WeatherIcon } from '@/features/weather/components/WeatherIcon';

export function DailyForecastRow({ points, timezone }) {
  const { formatTempRange } = useTemperatureUnit();
  if (points.length === 0) return null;

  return (
    <section className="rounded-xl border bg-card p-4">
      <h2 className="font-heading text-xl">Daily outlook</h2>
      <p className="mt-1 text-sm text-muted-foreground">Up to 10 days with min/max, precipitation, and UV.</p>
      <ul className="mt-4 flex flex-col gap-3">
        {points.map((point) => (
          <li key={point.dt} className="rounded-lg border bg-muted/20 p-3">
            <div className="grid grid-cols-[4rem_2rem_1fr_auto] items-start gap-3">
              <span className="text-sm font-medium">{formatDayLabel(point.dt, timezone)}</span>
              {point.icon ? (
                <WeatherIcon icon={point.icon} alt={point.description ?? ''} size={32} />
              ) : (
                <span className="w-8" />
              )}
              <div>
                <p className="text-sm">{point.description}</p>
                {point.summary ? (
                  <p className="mt-1 text-xs text-muted-foreground">{point.summary}</p>
                ) : null}
                {point.condition ? (
                  <p className="mt-1 text-xs text-muted-foreground">{point.condition}</p>
                ) : null}
              </div>
              <span className="font-tabular text-sm">{formatTempRange(point.tempMin, point.tempMax)}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {formatPop(point.pop) ? <span>Rain chance {formatPop(point.pop)}</span> : null}
              {point.rain1h != null ? <span>Rain {formatPrecipMm(point.rain1h)}</span> : null}
              {point.snow1h != null ? <span>Snow {formatPrecipMm(point.snow1h)}</span> : null}
              {point.windSpeedKmh != null ? <span>{formatWind(point.windSpeedKmh, point.windDeg)}</span> : null}
              {point.windGustKmh != null ? <span>Gust {point.windGustKmh} km/h</span> : null}
              {point.uvi != null ? <span>UV {formatUvi(point.uvi)}</span> : null}
              {point.moonPhase != null ? <span>{formatMoonPhase(point.moonPhase)}</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
