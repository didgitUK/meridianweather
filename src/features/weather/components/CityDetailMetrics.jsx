'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  formatPercent,
  formatPrecipMm,
  formatPressure,
  formatUvi,
  formatVisibility,
  formatWind,
  resolvePrecipitation,
} from '@/features/weather/utils/forecast-formatters';
import { useTemperatureUnit } from '@/providers/TemperatureUnitProvider';
import { buildCityDetailMetricTrends } from '@/features/weather/utils/metric-trend';
import { METRIC_METEOCON } from '@/features/weather/utils/weather-icon';
import { MetricTile } from '@/features/weather/components/metrics/MetricTile';

const tileClassName = 'bg-card';

export function CityDetailMetrics({ current, hourlyPoints = [] }) {
  const t = useTranslations('CityDetail.metrics');
  const { formatTemp } = useTemperatureUnit();
  const trends = useMemo(
    () => buildCityDetailMetricTrends(current, hourlyPoints),
    [current, hourlyPoints],
  );

  if (!current) {
    return null;
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {current.condition ?? 'Weather'}
        {current.weatherId != null ? ` · ID ${current.weatherId}` : ''}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricTile className={tileClassName} iconName={METRIC_METEOCON.temperature} label={t('temperature')} value={formatTemp(current.temperature)} trend={trends.temperature} />
        <MetricTile className={tileClassName} iconName={METRIC_METEOCON.feelsLike} label={t('feelsLike')} value={formatTemp(current.feelsLike)} trend={trends.feelsLike} />
        <MetricTile className={tileClassName} iconName={METRIC_METEOCON.humidity} label={t('humidity')} value={formatPercent(current.humidity)} trend={trends.humidity} />
        <MetricTile className={tileClassName} iconName={METRIC_METEOCON.pressure} label={t('pressure')} value={formatPressure(current.pressure)} trend={trends.pressure} />
        <MetricTile className={tileClassName} iconName={METRIC_METEOCON.dewPoint} label={t('dewPoint')} value={formatTemp(current.dewPoint)} trend={trends.dewPoint} />
        <MetricTile className={tileClassName} iconName={METRIC_METEOCON.uvi} label={t('uvIndex')} value={formatUvi(current.uvi)} trend={trends.uvi} />
        <MetricTile className={tileClassName} iconName={METRIC_METEOCON.clouds} label={t('cloudCover')} value={formatPercent(current.clouds)} trend={trends.clouds} />
        <MetricTile className={tileClassName} iconName={METRIC_METEOCON.visibility} label={t('visibility')} value={formatVisibility(current.visibility)} trend={trends.visibility} />
        <MetricTile className={tileClassName} iconName={METRIC_METEOCON.wind} label={t('wind')} value={formatWind(current.windSpeedKmh, current.windDeg)} trend={trends.windSpeedKmh} />
        <MetricTile className={tileClassName} iconName={METRIC_METEOCON.windGust} label={t('windGust')} value={formatWind(current.windGustKmh, current.windDeg)} trend={trends.windGustKmh} />
        <MetricTile className={tileClassName} iconName={METRIC_METEOCON.rain} label={t('rain1h')} value={formatPrecipMm(resolvePrecipitation(current))} trend={trends.precipitation} />
        <MetricTile className={tileClassName} iconName={METRIC_METEOCON.snow} label={t('snow1h')} value={formatPrecipMm(current.snow1h)} trend={trends.snow1h} />
      </div>
    </div>
  );
}
