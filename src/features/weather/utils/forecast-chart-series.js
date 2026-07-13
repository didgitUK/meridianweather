import { TEMPERATURE_UNIT } from '@/constants/temperature-unit';
import {
  formatClockHourLabel,
  getLocalHour,
  resolveDateKey,
} from '@/features/weather/utils/forecast-formatters';
import { formatTemperature } from '@/features/weather/utils/formatWeather';
import { createTimeContext } from '@/features/weather/utils/forecast-time-context';
import {
  filterArchivedHourlyPointsForDay,
  filterHourlyPointsForDay,
  observationsToChartPoints,
} from '@/features/weather/utils/forecast-day-model';

function resolveTime(timezoneOrContext, timezoneOffset = null) {
  if (timezoneOrContext && typeof timezoneOrContext === 'object' && 'timezone' in timezoneOrContext) {
    return timezoneOrContext;
  }

  return createTimeContext({ timezone: timezoneOrContext ?? 'UTC', timezoneOffset });
}

export function mergeChartPoints(pointGroups) {
  const byDt = new Map();

  for (const group of pointGroups) {
    for (const point of group) {
      if (point?.dt == null) {
        continue;
      }

      if (!byDt.has(point.dt)) {
        byDt.set(point.dt, point);
      }
    }
  }

  return [...byDt.values()].sort((a, b) => a.dt - b.dt);
}

function lerpValue(left, right, ratio) {
  if (left == null) {
    return right ?? null;
  }

  if (right == null) {
    return left;
  }

  return left + (right - left) * ratio;
}

function interpolateChartPoint(left, right, dt) {
  const gap = right.dt - left.dt;
  const ratio = gap > 0 ? (dt - left.dt) / gap : 0;

  return {
    dt,
    temp: lerpValue(left.temp, right.temp, ratio),
    pop: lerpValue(left.pop, right.pop, ratio),
    rain1h: lerpValue(left.rain1h, right.rain1h, ratio),
    windSpeedKmh: lerpValue(left.windSpeedKmh, right.windSpeedKmh, ratio),
    windDeg: ratio < 0.5 ? left.windDeg ?? right.windDeg : right.windDeg ?? left.windDeg,
    description: ratio < 0.5 ? left.description ?? right.description : right.description ?? left.description,
    icon: ratio < 0.5 ? left.icon ?? right.icon : right.icon ?? left.icon,
  };
}

export function densifyChartPoints(points, intervalSeconds = 3600) {
  const sorted = mergeChartPoints([points]);

  if (sorted.length <= 1) {
    return sorted;
  }

  const densified = [];

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const left = sorted[index];
    const right = sorted[index + 1];

    densified.push(left);

    for (let dt = left.dt + intervalSeconds; dt < right.dt; dt += intervalSeconds) {
      densified.push(interpolateChartPoint(left, right, dt));
    }
  }

  densified.push(sorted[sorted.length - 1]);

  return densified;
}

export function buildDayChartPoints({
  dateKey,
  timezone,
  timezoneOffset = null,
  hourlyPoints,
  archivedHourlyRows = [],
  observations = [],
  includeObservations = false,
  time: timeInput = null,
}) {
  const time = timeInput ?? resolveTime(timezone, timezoneOffset);
  const livePoints = filterHourlyPointsForDay(hourlyPoints, dateKey, time);
  const archivedPoints = filterArchivedHourlyPointsForDay(
    archivedHourlyRows,
    dateKey,
    time,
  );
  const observationPoints = includeObservations
    ? observationsToChartPoints(observations).filter(
        (point) => resolveDateKey(point.dt, time.timezone, time.timezoneOffset) === dateKey,
      )
    : [];

  return densifyChartPoints(mergeChartPoints([livePoints, archivedPoints, observationPoints]));
}

const CHART_AXIS_HOURS = [0, 3, 6, 9, 12, 15, 18, 21];

export function buildChartAxisLabels(
  coordinates,
  timezone = null,
  timezoneOffsetSeconds = null,
  maxDistanceHours = 1.5,
) {
  if (coordinates.length === 0) {
    return [];
  }

  if (coordinates.length <= 8) {
    return coordinates.map((point) => ({
      x: point.x,
      text: formatClockHourLabel(getLocalHour(point.dt, timezone, timezoneOffsetSeconds)),
    }));
  }

  const axisLabels = [];

  for (const bucketHour of CHART_AXIS_HOURS) {
    let bestPoint = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const point of coordinates) {
      const hour = getLocalHour(point.dt, timezone, timezoneOffsetSeconds);
      const distance = Math.abs(hour - bucketHour);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestPoint = point;
      }
    }

    if (bestPoint && bestDistance <= maxDistanceHours) {
      axisLabels.push({
        x: bestPoint.x,
        text: formatClockHourLabel(bucketHour),
      });
    }
  }

  return axisLabels;
}

export const FORECAST_METRIC_TABS = [
  { id: 'temperature', label: 'Temperature' },
  { id: 'precipitation', label: 'Precipitation' },
  { id: 'wind', label: 'Wind' },
];

export function getMetricValue(point, metricId) {
  switch (metricId) {
    case 'temperature':
      return point.temp;
    case 'precipitation':
      if (point.pop != null) {
        return point.pop * 100;
      }

      if (point.rain1h != null) {
        return point.rain1h;
      }

      return 0;
    case 'wind':
      return point.windSpeedKmh;
    default:
      return null;
  }
}

export function formatMetricValue(value, metricId, unit = TEMPERATURE_UNIT.CELSIUS) {
  if (value == null) {
    return '—';
  }

  switch (metricId) {
    case 'temperature':
      return formatTemperature(value, unit);
    case 'precipitation':
      return value <= 1 ? `${Math.round(value)}%` : `${value} mm`;
    case 'wind':
      return `${Math.round(value)}`;
    default:
      return String(value);
  }
}

export function buildChartSeries(points, metricId) {
  const values = points
    .map((point) => getMetricValue(point, metricId))
    .filter((value) => value != null);

  if (values.length === 0) {
    return { points: [], min: 0, max: 1 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const paddedMin = metricId === 'precipitation' ? 0 : min - Math.max((max - min) * 0.1, 1);
  const paddedMax = max + Math.max((max - min) * 0.1, metricId === 'precipitation' ? 10 : 1);

  return {
    points: points.map((point, index) => ({
      index,
      dt: point.dt,
      value: getMetricValue(point, metricId),
    })),
    min: paddedMin,
    max: paddedMax,
  };
}
