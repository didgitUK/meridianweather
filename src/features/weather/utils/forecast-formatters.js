import {
  TEMPERATURE_UNIT,
  convertTemperatureFromCelsius,
  normalizeTemperatureUnit,
  temperatureUnitSuffix,
} from '@/constants/temperature-unit';
import { getActiveDateLocale } from '@/features/weather/utils/forecast-date-locale';

export function formatPrecipMm(value) {
  if (value == null) {
    return '—';
  }

  return `${value} mm`;
}

export function resolvePrecipitation(point) {
  if (point == null) {
    return null;
  }

  if (point.precipitation != null) {
    return point.precipitation;
  }

  if (point.rain1h != null) {
    return point.rain1h;
  }

  if (point.rain3h != null) {
    return point.rain3h;
  }

  if (point.pop === 0) {
    return 0;
  }

  return null;
}

export function formatSunTime(timestamp, timezone = null) {
  if (timestamp == null) {
    return '—';
  }

  return new Date(timestamp * 1000).toLocaleTimeString(getActiveDateLocale(), {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone ?? undefined,
  });
}

export function formatTimezoneLabel(timezone, offsetSeconds = null) {
  if (!timezone) {
    return '—';
  }

  if (offsetSeconds == null) {
    return timezone;
  }

  const sign = offsetSeconds >= 0 ? '+' : '-';
  const hours = Math.abs(Math.round(offsetSeconds / 3600));
  return `${timezone} (GMT${sign}${hours})`;
}

export function formatCoordinates(lat, lon) {
  if (lat == null || lon == null) {
    return '—';
  }

  return `${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)}`;
}

export function formatMoonPhase(phase) {
  if (phase == null) {
    return '—';
  }

  if (phase < 0.125) return 'New moon';
  if (phase < 0.375) return 'Waxing crescent';
  if (phase < 0.625) return 'Full moon';
  if (phase < 0.875) return 'Waning crescent';
  return 'New moon';
}

export function formatDayLabel(timestamp, timezone = null) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString(getActiveDateLocale(), {
    weekday: 'short',
    timeZone: timezone ?? undefined,
  });
}

export function formatDayWithDate(timestamp, timezone = null) {
  const date = new Date(timestamp * 1000);
  const weekday = date.toLocaleDateString(getActiveDateLocale(), {
    weekday: 'short',
    timeZone: timezone ?? undefined,
  });
  const dayMonth = date.toLocaleDateString(getActiveDateLocale(), {
    day: 'numeric',
    month: 'short',
    timeZone: timezone ?? undefined,
  });
  return { weekday, dayMonth };
}

/**
 * Calendar day key (YYYY-MM-DD) for a unix timestamp in the location zone.
 * Prefer numeric OpenWeather timezone_offset; else IANA; else UTC.
 */
export function localCalendarDayKey(timestamp, timezoneOffsetSeconds = null, timezone = null) {
  if (timestamp == null) {
    return null;
  }

  if (timezoneOffsetSeconds != null && Number.isFinite(Number(timezoneOffsetSeconds))) {
    const local = new Date(timestamp * 1000 + Number(timezoneOffsetSeconds) * 1000);
    const year = local.getUTCFullYear();
    const month = String(local.getUTCMonth() + 1).padStart(2, '0');
    const day = String(local.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  if (timezone) {
    const parts = new Intl.DateTimeFormat(getActiveDateLocale(), {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date(timestamp * 1000));
    const year = parts.find((part) => part.type === 'year')?.value;
    const month = parts.find((part) => part.type === 'month')?.value;
    const day = parts.find((part) => part.type === 'day')?.value;
    if (year && month && day) {
      return `${year}-${month}-${day}`;
    }
  }

  const utc = new Date(timestamp * 1000);
  const year = utc.getUTCFullYear();
  const month = String(utc.getUTCMonth() + 1).padStart(2, '0');
  const day = String(utc.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftCalendarDayKey(dateKey, days) {
  const [year, month, day] = String(dateKey).split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day));
  shifted.setUTCDate(shifted.getUTCDate() + days);
  const nextYear = shifted.getUTCFullYear();
  const nextMonth = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const nextDay = String(shifted.getUTCDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

/** Labels from a Y-M-D key — weekday / date never depend on browser TZ. */
export function formatCalendarDayKey(dateKey) {
  const [year, month, day] = String(dateKey).split('-').map(Number);
  const noonUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return {
    dateKey,
    weekday: noonUtc.toLocaleDateString(getActiveDateLocale(), { weekday: 'short', timeZone: 'UTC' }),
    dayMonth: noonUtc.toLocaleDateString(getActiveDateLocale(), {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    }),
    year: String(year),
  };
}

/**
 * Always return `count` consecutive calendar days from the first forecast point
 * (no skipped Sundays / jumped Mondays from timezone drift).
 */
export function buildConsecutiveDailyRows(
  points = [],
  {
    count = 7,
    timezone = null,
    timezoneOffset = null,
  } = {},
) {
  const valid = (Array.isArray(points) ? points : []).filter((point) => point?.dt != null);
  if (valid.length === 0 || count <= 0) {
    return [];
  }

  const offset = timezoneOffset != null ? Number(timezoneOffset) : null;
  const byKey = new Map();

  for (const point of valid) {
    const key = localCalendarDayKey(point.dt, offset, timezone);
    if (key && !byKey.has(key)) {
      byKey.set(key, point);
    }
  }

  const startKey = localCalendarDayKey(valid[0].dt, offset, timezone);
  if (!startKey) {
    return [];
  }

  const rows = [];
  for (let index = 0; index < count; index += 1) {
    const dateKey = shiftCalendarDayKey(startKey, index);
    const labels = formatCalendarDayKey(dateKey);
    rows.push({
      ...labels,
      point: byKey.get(dateKey) ?? null,
    });
  }

  return rows;
}

export function getLocalHour(timestamp, timezone = null, timezoneOffsetSeconds = null) {
  if (timezone) {
    const parts = new Intl.DateTimeFormat(getActiveDateLocale(), {
      hour: '2-digit',
      hour12: false,
      timeZone: timezone,
    }).formatToParts(new Date(timestamp * 1000));

    return Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
  }

  if (timezoneOffsetSeconds != null) {
    return new Date(timestamp * 1000 + timezoneOffsetSeconds * 1000).getUTCHours();
  }

  return new Date(timestamp * 1000).getHours();
}

export function formatHourLabel(timestamp, timezone = null, timezoneOffsetSeconds = null) {
  if (timezone) {
    return new Date(timestamp * 1000).toLocaleTimeString(getActiveDateLocale(), {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
    });
  }

  if (timezoneOffsetSeconds != null) {
    const localDate = new Date(timestamp * 1000 + timezoneOffsetSeconds * 1000);
    const hour = String(localDate.getUTCHours()).padStart(2, '0');
    const minute = String(localDate.getUTCMinutes()).padStart(2, '0');

    return `${hour}:${minute}`;
  }

  return new Date(timestamp * 1000).toLocaleTimeString(getActiveDateLocale(), {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatClockHourLabel(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

function formatTempValue(value, unit = TEMPERATURE_UNIT.CELSIUS) {
  if (value == null) {
    return null;
  }

  return Math.round(convertTemperatureFromCelsius(value, normalizeTemperatureUnit(unit)));
}

export function formatTempRange(min, max, unit = TEMPERATURE_UNIT.CELSIUS) {
  const normalized = normalizeTemperatureUnit(unit);
  const suffix = temperatureUnitSuffix(normalized);
  const minDisplay = formatTempValue(min, normalized);
  const maxDisplay = formatTempValue(max, normalized);

  if (minDisplay == null && maxDisplay == null) return '—';
  if (minDisplay == null) return `${maxDisplay}${suffix}`;
  if (maxDisplay == null) return `${minDisplay}${suffix}`;
  return `${minDisplay}${suffix} / ${maxDisplay}${suffix}`;
}

export function formatPop(value) {
  if (value == null) return null;
  return `${Math.round(value * 100)}%`;
}

export function formatWind(speedKmh, deg = null) {
  if (speedKmh == null) {
    return '—';
  }

  const speed = Number(speedKmh);
  const speedLabel = Number.isFinite(speed) ? speed.toFixed(2) : String(speedKmh);

  if (deg == null) {
    return `${speedLabel} km/h`;
  }

  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const direction = directions[Math.round(deg / 45) % 8];

  return `${speedLabel} km/h ${direction}`;
}

export function formatPressure(hpa) {
  if (hpa == null) {
    return '—';
  }

  return `${hpa} hPa`;
}

export function formatVisibility(meters) {
  if (meters == null) {
    return '—';
  }

  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }

  return `${meters} m`;
}

export function formatUvi(uvi) {
  if (uvi == null) {
    return '—';
  }

  return String(Math.round(uvi * 10) / 10);
}

export function formatPercent(value) {
  if (value == null) {
    return '—';
  }

  return `${value}%`;
}

export function toDateInputValueWithOffset(timestamp, timezoneOffsetSeconds) {
  const localMs = timestamp * 1000 + timezoneOffsetSeconds * 1000;
  const localDate = new Date(localMs);
  const year = localDate.getUTCFullYear();
  const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(localDate.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function toDateInputValue(timestamp, timezone = null) {
  const date = new Date(timestamp * 1000);
  const parts = new Intl.DateTimeFormat(getActiveDateLocale(), {
    timeZone: timezone ?? undefined,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  return `${year}-${month}-${day}`;
}

export function resolveDateKey(timestamp, timezone = null, timezoneOffsetSeconds = null) {
  if (timezone) {
    return toDateInputValue(timestamp, timezone);
  }

  if (timezoneOffsetSeconds != null) {
    return toDateInputValueWithOffset(timestamp, timezoneOffsetSeconds);
  }

  return toDateInputValue(timestamp);
}

export function getMonthHistoryQueryBounds(todayKey) {
  if (!todayKey) {
    return null;
  }

  const [year, month] = todayKey.split('-').map(Number);
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

  return {
    from: `${monthPrefix}-01T00:00:00.000Z`,
    to: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    limit: 2000,
  };
}

export function isSameCalendarDay(timestamp, dateInput, timezone = null) {
  return toDateInputValue(timestamp, timezone) === dateInput;
}
