'use client';

import { cn } from '@/lib/utils';
import { Archive, CloudRain, Sun, ThermometerSun, Wind } from 'lucide-react';
import {
  formatPop,
  formatUvi,
  formatWind,
} from '@/features/weather/utils/forecast-formatters';
import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import { ForecastStatItem } from '@/features/weather/components/metrics/ForecastStatItem';

export function ForecastDayStats({ day, current = null, isForecastDay = true, className }) {
  const { formatTemp } = useTemperatureUnit();

  if (!day && !current) {
    return null;
  }

  const dailyPoint = day?.dailyPoint;
  const pop = day?.pop ?? dailyPoint?.pop ?? current?.pop;
  const uvi = dailyPoint?.uvi ?? current?.uvi;
  const windSpeedKmh = dailyPoint?.windSpeedKmh ?? current?.windSpeedKmh;
  const windDeg = dailyPoint?.windDeg ?? current?.windDeg;
  const feelsLike = dailyPoint?.feelsLike ?? current?.feelsLike;

  const hasForecastStats =
    (isForecastDay && formatPop(pop))
    || windSpeedKmh != null
    || uvi != null
    || feelsLike != null;

  const hasHistoryStats = !isForecastDay && day?.observationCount > 0;

  if (!hasForecastStats && !hasHistoryStats) {
    return null;
  }

  return (
    <div className={cn('flex flex-col gap-2 border-l border-border/60 pl-4', className)}>
      {isForecastDay && formatPop(pop) ? (
        <ForecastStatItem icon={CloudRain}>Rain chance {formatPop(pop)}</ForecastStatItem>
      ) : null}
      {windSpeedKmh != null ? (
        <ForecastStatItem icon={Wind}>{formatWind(windSpeedKmh, windDeg)}</ForecastStatItem>
      ) : null}
      {uvi != null ? <ForecastStatItem icon={Sun}>UV {formatUvi(uvi)}</ForecastStatItem> : null}
      {feelsLike != null ? (
        <ForecastStatItem icon={ThermometerSun}>Feels like {formatTemp(feelsLike)}</ForecastStatItem>
      ) : null}
      {!isForecastDay && day?.observationCount > 0 ? (
        <ForecastStatItem icon={Archive}>{day.observationCount} stored readings</ForecastStatItem>
      ) : null}
    </div>
  );
}
