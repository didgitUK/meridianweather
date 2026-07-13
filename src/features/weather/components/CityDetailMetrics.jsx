'use client';

import { useMemo } from 'react';
import {
  Cloud,
  CloudRain,
  Droplet,
  Droplets,
  Eye,
  Gauge,
  Snowflake,
  Sun,
  Thermometer,
  ThermometerSun,
  Wind,
} from 'lucide-react';
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
import { MetricTile } from '@/features/weather/components/metrics/MetricTile';

const tileClassName = 'bg-card';

export function CityDetailMetrics({ current, hourlyPoints = [] }) {
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
        <MetricTile className={tileClassName} icon={Thermometer} label="Temperature" value={formatTemp(current.temperature)} trend={trends.temperature} />
        <MetricTile className={tileClassName} icon={ThermometerSun} label="Feels like" value={formatTemp(current.feelsLike)} trend={trends.feelsLike} />
        <MetricTile className={tileClassName} icon={Droplets} label="Humidity" value={formatPercent(current.humidity)} trend={trends.humidity} />
        <MetricTile className={tileClassName} icon={Gauge} label="Pressure" value={formatPressure(current.pressure)} trend={trends.pressure} />
        <MetricTile className={tileClassName} icon={Droplet} label="Dew point" value={formatTemp(current.dewPoint)} trend={trends.dewPoint} />
        <MetricTile className={tileClassName} icon={Sun} label="UV index" value={formatUvi(current.uvi)} trend={trends.uvi} />
        <MetricTile className={tileClassName} icon={Cloud} label="Cloud cover" value={formatPercent(current.clouds)} trend={trends.clouds} />
        <MetricTile className={tileClassName} icon={Eye} label="Visibility" value={formatVisibility(current.visibility)} trend={trends.visibility} />
        <MetricTile className={tileClassName} icon={Wind} label="Wind" value={formatWind(current.windSpeedKmh, current.windDeg)} trend={trends.windSpeedKmh} />
        <MetricTile className={tileClassName} icon={Wind} label="Wind gust" value={formatWind(current.windGustKmh, current.windDeg)} trend={trends.windGustKmh} />
        <MetricTile className={tileClassName} icon={CloudRain} label="Rain (1h)" value={formatPrecipMm(resolvePrecipitation(current))} trend={trends.precipitation} />
        <MetricTile className={tileClassName} icon={Snowflake} label="Snow (1h)" value={formatPrecipMm(current.snow1h)} trend={trends.snow1h} />
      </div>
    </div>
  );
}
