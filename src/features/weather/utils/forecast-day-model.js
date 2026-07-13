import {
  formatDayLabel,
  resolveDateKey,
} from '@/features/weather/utils/forecast-formatters';
import { createTimeContext } from '@/features/weather/utils/forecast-time-context';

function resolveTime(timezoneOrContext, timezoneOffset = null) {
  if (timezoneOrContext && typeof timezoneOrContext === 'object' && 'timezone' in timezoneOrContext) {
    return timezoneOrContext;
  }

  return createTimeContext({ timezone: timezoneOrContext ?? 'UTC', timezoneOffset });
}

export function formatCarouselDayLabel(timestamp, timezone, todayKey, timezoneOffset = null) {
  const time = resolveTime(timezone, timezoneOffset);
  const dateKey = resolveDateKey(timestamp, time.timezone, time.timezoneOffset);

  if (dateKey === todayKey) {
    return 'Today';
  }

  return formatDayLabel(timestamp, time.timezone);
}

export function filterHourlyPointsForDay(points, dateKey, timezone, timezoneOffset = null) {
  const time = resolveTime(timezone, timezoneOffset);
  return points.filter(
    (point) => resolveDateKey(point.dt, time.timezone, time.timezoneOffset) === dateKey,
  );
}

export function groupObservationsByDay(observations, timezone, timezoneOffset = null) {
  const time = resolveTime(timezone, timezoneOffset);
  const groups = new Map();

  for (const observation of observations) {
    if (observation.updatedAt == null) {
      continue;
    }

    const dayKey = resolveDateKey(observation.updatedAt, time.timezone, time.timezoneOffset);
    const bucket = groups.get(dayKey) ?? [];
    bucket.push(observation);
    groups.set(dayKey, bucket);
  }

  for (const bucket of groups.values()) {
    bucket.sort((a, b) => {
      const aTime = Date.parse(a.observedAt ?? 0);
      const bTime = Date.parse(b.observedAt ?? 0);
      return bTime - aTime;
    });
  }

  return groups;
}

function summarizeObservations(observations) {
  const temperatures = observations
    .map((observation) => observation.temperature)
    .filter((value) => value != null);

  const latest = observations[0];

  return {
    icon: latest?.icon ?? null,
    description: latest?.description ?? 'Stored observation',
    tempMin: temperatures.length > 0 ? Math.min(...temperatures) : null,
    tempMax: temperatures.length > 0 ? Math.max(...temperatures) : null,
    pop: null,
    observationCount: observations.length,
  };
}

function entryFromDailyPoint(point, time, todayKey, source, observationCount = 0) {
  const dateKey = resolveDateKey(point.dt, time.timezone, time.timezoneOffset);

  return {
    dateKey,
    dayLabel: formatCarouselDayLabel(point.dt, time, todayKey),
    icon: point.icon ?? null,
    description: point.description ?? point.condition ?? 'Forecast',
    tempMin: point.tempMin ?? point.temp ?? null,
    tempMax: point.tempMax ?? point.temp ?? null,
    pop: point.pop ?? null,
    source,
    dailyPoint: point,
    observationCount,
  };
}

export function dedupeArchivedDailyPoints(archivedDailyRows, timezone, timezoneOffset = null) {
  const time = resolveTime(timezone, timezoneOffset);
  const byDateKey = new Map();

  for (const row of archivedDailyRows) {
    const point = row?.point;

    if (point?.dt == null) {
      continue;
    }

    const dateKey = resolveDateKey(point.dt, time.timezone, time.timezoneOffset);
    const issuedAt = Date.parse(row.issuedAt ?? 0);
    const existing = byDateKey.get(dateKey);

    if (!existing || issuedAt > existing.issuedAt) {
      byDateKey.set(dateKey, { point, issuedAt });
    }
  }

  return [...byDateKey.values()]
    .map(({ point }) => point)
    .sort((a, b) => a.dt - b.dt);
}

export function dedupeArchivedHourlyPoints(archivedHourlyRows) {
  const byDt = new Map();

  for (const row of archivedHourlyRows) {
    const point = row?.point;

    if (point?.dt == null) {
      continue;
    }

    const issuedAt = Date.parse(row.issuedAt ?? 0);
    const existing = byDt.get(point.dt);

    if (!existing || issuedAt > existing.issuedAt) {
      byDt.set(point.dt, { point, issuedAt });
    }
  }

  return [...byDt.values()]
    .map(({ point }) => point)
    .sort((a, b) => a.dt - b.dt);
}

export function aggregateHourlyPointsToDaily(hourlyPoints, timezone, timezoneOffset = null) {
  const time = resolveTime(timezone, timezoneOffset);
  const byDateKey = new Map();

  for (const point of hourlyPoints) {
    if (point.dt == null) {
      continue;
    }

    const dateKey = resolveDateKey(point.dt, time.timezone, time.timezoneOffset);
    const bucket = byDateKey.get(dateKey) ?? { dateKey, temps: [], pops: [], points: [] };

    if (point.temp != null) {
      bucket.temps.push(point.temp);
    }

    if (point.tempMin != null) {
      bucket.temps.push(point.tempMin);
    }

    if (point.tempMax != null) {
      bucket.temps.push(point.tempMax);
    }

    if (point.pop != null) {
      bucket.pops.push(point.pop);
    }

    bucket.points.push(point);
    byDateKey.set(dateKey, bucket);
  }

  return [...byDateKey.values()]
    .map((bucket) => {
      const representative = bucket.points[Math.floor(bucket.points.length / 2)] ?? bucket.points[0];

      return {
        dt: representative.dt,
        icon: representative.icon ?? null,
        description: representative.description ?? representative.condition ?? 'Forecast',
        tempMin: bucket.temps.length > 0 ? Math.min(...bucket.temps) : null,
        tempMax: bucket.temps.length > 0 ? Math.max(...bucket.temps) : null,
        pop: bucket.pops.length > 0 ? Math.max(...bucket.pops) : null,
      };
    })
    .sort((a, b) => a.dt - b.dt);
}

export function buildForecastDayEntries({
  dailyPoints,
  hourlyPoints = [],
  archivedDailyRows = [],
  archivedHourlyRows = [],
  observations,
  timezone,
  timezoneOffset = null,
  todayKey,
  time: timeInput = null,
}) {
  const time = timeInput ?? resolveTime(timezone, timezoneOffset);
  const entries = new Map();

  for (const point of dedupeArchivedDailyPoints(archivedDailyRows, time)) {
    const dateKey = resolveDateKey(point.dt, time.timezone, time.timezoneOffset);
    entries.set(dateKey, entryFromDailyPoint(point, time, todayKey, 'archive', 0));
  }

  for (const point of aggregateHourlyPointsToDaily(
    dedupeArchivedHourlyPoints(archivedHourlyRows),
    time,
  )) {
    const dateKey = resolveDateKey(point.dt, time.timezone, time.timezoneOffset);

    if (!entries.has(dateKey)) {
      entries.set(dateKey, entryFromDailyPoint(point, time, todayKey, 'archive', 0));
    }
  }

  for (const point of aggregateHourlyPointsToDaily(hourlyPoints, time)) {
    const dateKey = resolveDateKey(point.dt, time.timezone, time.timezoneOffset);

    if (!entries.has(dateKey)) {
      entries.set(dateKey, entryFromDailyPoint(point, time, todayKey, 'hourly', 0));
    }
  }

  for (const point of dailyPoints) {
    const dateKey = resolveDateKey(point.dt, time.timezone, time.timezoneOffset);
    const existing = entries.get(dateKey);

    entries.set(
      dateKey,
      entryFromDailyPoint(
        point,
        time,
        todayKey,
        'forecast',
        existing?.observationCount ?? 0,
      ),
    );
  }

  const observationDays = groupObservationsByDay(observations, time);

  for (const [dateKey, dayObservations] of observationDays) {
    if (dateKey > todayKey) {
      continue;
    }

    const summary = summarizeObservations(dayObservations);
    const existing = entries.get(dateKey);

    if (existing) {
      entries.set(dateKey, {
        ...existing,
        observationCount: summary.observationCount,
      });
      continue;
    }

    entries.set(dateKey, {
      dateKey,
      dayLabel: formatCarouselDayLabel(
        dayObservations[0].updatedAt,
        time,
        todayKey,
      ),
      icon: summary.icon,
      description: summary.description,
      tempMin: summary.tempMin,
      tempMax: summary.tempMax,
      pop: summary.pop,
      source: 'history',
      dailyPoint: null,
      observationCount: summary.observationCount,
    });
  }

  return [...entries.values()].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}

export function shiftDateKey(dateKey, days) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day));
  shifted.setUTCDate(shifted.getUTCDate() + days);

  const nextYear = shifted.getUTCFullYear();
  const nextMonth = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const nextDay = String(shifted.getUTCDate()).padStart(2, '0');

  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export function expandDayEntriesForCalendarMonth(
  dayEntries,
  todayKey,
  timezone = 'UTC',
  timezoneOffset = null,
) {
  const time = resolveTime(timezone, timezoneOffset);
  const [year, month] = todayKey.split('-').map(Number);
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const lastDayOfMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthEndKey = `${monthPrefix}-${String(lastDayOfMonth).padStart(2, '0')}`;
  const byKey = new Map(dayEntries.map((day) => [day.dateKey, day]));
  const lastDataKey = dayEntries.reduce(
    (max, day) => (day.dateKey > max ? day.dateKey : max),
    todayKey,
  );
  const effectiveEndKey = lastDataKey < monthEndKey ? lastDataKey : monthEndKey;
  const effectiveEndDay = Number(effectiveEndKey.split('-')[2]);
  const expanded = [];

  for (let day = 1; day <= effectiveEndDay; day += 1) {
    const dateKey = `${monthPrefix}-${String(day).padStart(2, '0')}`;
    const existing = byKey.get(dateKey);

    if (existing) {
      expanded.push(existing);
      continue;
    }

    const noonUtc = Math.floor(Date.UTC(year, month - 1, day, 12, 0, 0) / 1000);

    expanded.push({
      dateKey,
      dayLabel: formatCarouselDayLabel(noonUtc, time, todayKey),
      icon: null,
      description: null,
      tempMin: null,
      tempMax: null,
      pop: null,
      source: 'empty',
      dailyPoint: null,
      observationCount: 0,
      isEmpty: true,
    });
  }

  return expanded;
}

export function filterDayEntriesByRange(dayEntries, todayKey, range, timezone = 'UTC', timezoneOffset = null) {
  if (!todayKey) {
    return dayEntries;
  }

  if (range === 'month') {
    return expandDayEntriesForCalendarMonth(dayEntries, todayKey, timezone, timezoneOffset);
  }

  if (dayEntries.length === 0) {
    return dayEntries;
  }

  if (range === 'week') {
    const endKey = shiftDateKey(todayKey, 6);

    return dayEntries.filter((day) => day.dateKey >= todayKey && day.dateKey <= endKey);
  }

  return dayEntries;
}

export function observationsToChartPoints(observations) {
  return observations
    .filter((observation) => observation.updatedAt != null)
    .map((observation) => ({
      dt: observation.updatedAt,
      temp: observation.temperature ?? null,
      pop: null,
      rain1h: null,
      windSpeedKmh: observation.windSpeedKmh ?? null,
      windDeg: observation.windDeg ?? null,
      description: observation.description ?? null,
      icon: observation.icon ?? null,
    }))
    .sort((a, b) => a.dt - b.dt);
}

export function filterArchivedHourlyPointsForDay(
  archivedHourlyRows,
  dateKey,
  timezone,
  timezoneOffset = null,
) {
  const time = resolveTime(timezone, timezoneOffset);
  const byDt = new Map();

  for (const row of archivedHourlyRows) {
    const point = row?.point;

    if (point?.dt == null) {
      continue;
    }

    if (resolveDateKey(point.dt, time.timezone, time.timezoneOffset) !== dateKey) {
      continue;
    }

    const issuedAt = Date.parse(row.issuedAt ?? 0);
    const existing = byDt.get(point.dt);

    if (!existing || issuedAt > existing.issuedAt) {
      byDt.set(point.dt, { point, issuedAt });
    }
  }

  return [...byDt.values()]
    .map(({ point }) => point)
    .sort((a, b) => a.dt - b.dt);
}
