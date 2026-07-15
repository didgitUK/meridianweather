/** Meridian asks connectors for this many daily points when available. */
export const TARGET_DAILY_FORECAST_DAYS = 10;

function localDayKeyFromDt(dtSeconds, timezoneOffsetSeconds = 0) {
  const localMs = dtSeconds * 1000 + timezoneOffsetSeconds * 1000;
  const localDate = new Date(localMs);
  const year = localDate.getUTCFullYear();
  const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(localDate.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dayStartDt(dayKey, timezoneOffsetSeconds = 0) {
  const [year, month, day] = dayKey.split('-').map(Number);
  const utcMs = Date.UTC(year, month - 1, day, 12, 0, 0) - timezoneOffsetSeconds * 1000;
  return Math.floor(utcMs / 1000);
}

function shiftDateKey(dateKey, days) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day));
  shifted.setUTCDate(shifted.getUTCDate() + days);
  const nextYear = shifted.getUTCFullYear();
  const nextMonth = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const nextDay = String(shifted.getUTCDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export function enumerateForwardDateKeys(startKey, count) {
  if (!startKey || count <= 0) {
    return [];
  }

  const keys = [];
  for (let index = 0; index < count; index += 1) {
    keys.push(shiftDateKey(startKey, index));
  }
  return keys;
}

export function mergeDailyTimelinePoints(base = [], extras = [], timezoneOffset = 0) {
  const byKey = new Map();

  for (const point of base) {
    if (point?.dt == null) {
      continue;
    }
    byKey.set(localDayKeyFromDt(point.dt, timezoneOffset), point);
  }

  for (const point of extras) {
    if (point?.dt == null) {
      continue;
    }
    const key = localDayKeyFromDt(point.dt, timezoneOffset);
    if (!byKey.has(key)) {
      byKey.set(key, point);
    }
  }

  return [...byKey.values()].sort((a, b) => a.dt - b.dt);
}

function synthesizeDaySummaryCondition(summary) {
  const precip = summary?.precipitation?.total ?? 0;
  const clouds = summary?.cloud_cover?.afternoon ?? 0;

  if (precip >= 1) {
    return {
      weatherId: 500,
      condition: 'Rain',
      description: 'Precipitation likely',
      icon: '10d',
    };
  }

  if (clouds >= 70) {
    return {
      weatherId: 804,
      condition: 'Clouds',
      description: 'Overcast clouds',
      icon: '04d',
    };
  }

  if (clouds >= 30) {
    return {
      weatherId: 802,
      condition: 'Clouds',
      description: 'Scattered clouds',
      icon: '03d',
    };
  }

  return {
    weatherId: 800,
    condition: 'Clear',
    description: 'Clear sky',
    icon: '01d',
  };
}

export function normalizeDaySummaryPoint(summary, timezoneOffset = 0) {
  if (!summary?.date) {
    return null;
  }

  const temp = summary.temperature ?? {};
  const condition = synthesizeDaySummaryCondition(summary);

  return {
    dt: dayStartDt(summary.date, timezoneOffset),
    temp: temp.afternoon ?? temp.max ?? temp.min ?? null,
    feelsLike: temp.afternoon ?? null,
    tempMin: temp.min ?? null,
    tempMax: temp.max ?? null,
    tempDay: temp.afternoon ?? null,
    tempNight: temp.night ?? null,
    tempMorn: temp.morning ?? null,
    tempEve: temp.evening ?? null,
    humidity: summary.humidity?.afternoon ?? null,
    pressure: summary.pressure?.afternoon ?? null,
    clouds: summary.cloud_cover?.afternoon ?? null,
    windSpeedKmh:
      summary.wind?.max?.speed != null ? Math.round(summary.wind.max.speed * 3.6 * 10) / 10 : null,
    windDeg: summary.wind?.max?.direction ?? null,
    precipitation: summary.precipitation?.total ?? null,
    rain1h: summary.precipitation?.total ?? null,
    pop: summary.precipitation?.total > 0 ? 0.5 : 0,
    ...condition,
    summary: null,
    source: 'onecall_day_summary',
  };
}

function average(values) {
  const numbers = values.filter((value) => value != null && Number.isFinite(value));
  if (numbers.length === 0) {
    return null;
  }
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function roundTemp(value) {
  if (value == null || !Number.isFinite(value)) {
    return null;
  }
  return Math.round(value * 10) / 10;
}

/**
 * Free OpenWeather 2.5 only covers ~5–6 calendar days. When paid daily connectors
 * are unavailable, finish the 10-day horizon with a damped trend persistence model.
 * Extended days are flagged so the UI can label them honestly.
 */
export function synthesizeExtendedDailyPoints(
  existingPoints = [],
  timezoneOffset = 0,
  target = TARGET_DAILY_FORECAST_DAYS,
) {
  const sorted = [...existingPoints]
    .filter((point) => point?.dt != null)
    .sort((a, b) => a.dt - b.dt);

  if (sorted.length === 0 || sorted.length >= target) {
    return sorted.slice(0, target);
  }

  const recent = sorted.slice(-Math.min(3, sorted.length));
  const first = recent[0];
  const last = recent[recent.length - 1];
  const steps = Math.max(recent.length - 1, 1);
  const maxTrend = ((last.tempMax ?? last.temp ?? 0) - (first.tempMax ?? first.temp ?? 0)) / steps;
  const minTrend = ((last.tempMin ?? last.temp ?? 0) - (first.tempMin ?? first.temp ?? 0)) / steps;
  const avgMax = average(recent.map((point) => point.tempMax ?? point.temp)) ?? last.tempMax ?? last.temp ?? 15;
  const avgMin = average(recent.map((point) => point.tempMin ?? point.temp)) ?? last.tempMin ?? last.temp ?? 8;
  const avgPop = average(recent.map((point) => point.pop)) ?? last.pop ?? 0;

  const points = [...sorted];
  let cursorKey = localDayKeyFromDt(last.dt, timezoneOffset);
  let step = 0;

  while (points.length < target) {
    step += 1;
    cursorKey = shiftDateKey(cursorKey, 1);
    const damp = 0.65 ** step;
    const projectedMax = roundTemp(avgMax + maxTrend * step * damp);
    const projectedMin = roundTemp(avgMin + minTrend * step * damp);
    const orderedMax = Math.max(projectedMax ?? projectedMin ?? 0, projectedMin ?? projectedMax ?? 0);
    const orderedMin = Math.min(projectedMax ?? projectedMin ?? 0, projectedMin ?? projectedMax ?? 0);

    points.push({
      dt: dayStartDt(cursorKey, timezoneOffset),
      temp: orderedMax,
      tempMax: orderedMax,
      tempMin: orderedMin,
      feelsLike: orderedMax,
      pop: Math.max(0, Math.min(1, Number((avgPop ?? 0).toFixed(2)))),
      humidity: last.humidity ?? null,
      pressure: last.pressure ?? null,
      clouds: last.clouds ?? null,
      windSpeedKmh: last.windSpeedKmh ?? null,
      windDeg: last.windDeg ?? null,
      uvi: last.uvi != null ? Math.max(0, Number((last.uvi * damp).toFixed(1))) : null,
      weatherId: last.weatherId ?? 801,
      condition: last.condition ?? 'Clouds',
      description: 'Extended outlook',
      icon: last.icon ?? '03d',
      isExtended: true,
      source: 'extended_outlook',
    });
  }

  return points;
}

export { localDayKeyFromDt };
