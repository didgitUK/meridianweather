import { resolvePrecipitation } from '@/features/weather/utils/forecast-formatters';

export const METRIC_TREND = {
  UP: 'up',
  DOWN: 'down',
  FLAT: 'flat',
};

const THRESHOLDS = {
  temperature: 0.4,
  feelsLike: 0.4,
  humidity: 2,
  pressure: 1,
  dewPoint: 0.4,
  uvi: 0.2,
  clouds: 3,
  visibility: 100,
  windSpeedKmh: 0.5,
  windGustKmh: 0.5,
  precipitation: 0.05,
  snow1h: 0.05,
};

const COMPARISON_OFFSET_SECONDS = 60 * 60;
const COMPARISON_WINDOW_SECONDS = COMPARISON_OFFSET_SECONDS * 0.75;

/**
 * @param {number | string | null | undefined} currentValue
 * @param {number | string | null | undefined} previousValue
 * @param {number} [threshold]
 * @returns {typeof METRIC_TREND[keyof typeof METRIC_TREND] | null}
 */
export function resolveMetricTrend(currentValue, previousValue, threshold = 0) {
  if (currentValue == null || previousValue == null) {
    return null;
  }

  const current = Number(currentValue);
  const previous = Number(previousValue);

  if (!Number.isFinite(current) || !Number.isFinite(previous)) {
    return null;
  }

  const diff = current - previous;

  if (Math.abs(diff) <= threshold) {
    return METRIC_TREND.FLAT;
  }

  return diff > 0 ? METRIC_TREND.UP : METRIC_TREND.DOWN;
}

/**
 * @param {Array<{ dt?: number }>} hourlyPoints
 * @param {number | null | undefined} referenceUnixSeconds
 * @param {number} [offsetSeconds]
 */
export function findHourlyComparisonPoint(
  hourlyPoints,
  referenceUnixSeconds,
  offsetSeconds = COMPARISON_OFFSET_SECONDS,
) {
  if (!referenceUnixSeconds || !Array.isArray(hourlyPoints) || hourlyPoints.length === 0) {
    return null;
  }

  const target = referenceUnixSeconds - offsetSeconds;
  let best = null;
  let bestDelta = Infinity;

  for (const point of hourlyPoints) {
    if (point.dt == null) {
      continue;
    }

    const delta = Math.abs(point.dt - target);

    if (delta < bestDelta) {
      bestDelta = delta;
      best = point;
    }
  }

  return bestDelta <= COMPARISON_WINDOW_SECONDS ? best : null;
}

/**
 * @param {Record<string, unknown> | null | undefined} current
 * @param {Array<Record<string, unknown>>} [hourlyPoints]
 */
export function buildCityDetailMetricTrends(current, hourlyPoints = []) {
  const previous = findHourlyComparisonPoint(hourlyPoints, current?.updatedAt);

  if (!current || !previous) {
    return {};
  }

  return {
    temperature: resolveMetricTrend(current.temperature, previous.temp, THRESHOLDS.temperature),
    feelsLike: resolveMetricTrend(current.feelsLike, previous.feelsLike, THRESHOLDS.feelsLike),
    humidity: resolveMetricTrend(current.humidity, previous.humidity, THRESHOLDS.humidity),
    pressure: resolveMetricTrend(current.pressure, previous.pressure, THRESHOLDS.pressure),
    dewPoint: resolveMetricTrend(current.dewPoint, previous.dewPoint, THRESHOLDS.dewPoint),
    uvi: resolveMetricTrend(current.uvi, previous.uvi, THRESHOLDS.uvi),
    clouds: resolveMetricTrend(current.clouds, previous.clouds, THRESHOLDS.clouds),
    visibility: resolveMetricTrend(current.visibility, previous.visibility, THRESHOLDS.visibility),
    windSpeedKmh: resolveMetricTrend(
      current.windSpeedKmh,
      previous.windSpeedKmh,
      THRESHOLDS.windSpeedKmh,
    ),
    windGustKmh: resolveMetricTrend(
      current.windGustKmh,
      previous.windGustKmh,
      THRESHOLDS.windGustKmh,
    ),
    precipitation: resolveMetricTrend(
      resolvePrecipitation(current),
      resolvePrecipitation(previous),
      THRESHOLDS.precipitation,
    ),
    snow1h: resolveMetricTrend(current.snow1h, previous.snow1h, THRESHOLDS.snow1h),
  };
}
