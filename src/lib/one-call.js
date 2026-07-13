function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function toKmh(speedMs) {
  if (speedMs == null) return null;
  return Math.round(speedMs * 3.6 * 10) / 10;
}

function extractWeather(weatherArray) {
  const weather = weatherArray?.[0] ?? {};

  return {
    weatherId: weather.id ?? null,
    condition: weather.main ?? null,
    description: capitalize(weather.description ?? ''),
    icon: weather.icon ?? null,
  };
}

function extractRainSnow(point) {
  const rainValue = point.rain;
  const snowValue = point.snow;
  const rain1h = typeof rainValue === 'object' ? rainValue?.['1h'] ?? null : rainValue ?? null;
  const rain3h = typeof rainValue === 'object' ? rainValue?.['3h'] ?? null : null;

  return {
    rain1h,
    rain3h,
    snow1h: typeof snowValue === 'object' ? snowValue?.['1h'] ?? null : snowValue ?? null,
    snow3h: typeof snowValue === 'object' ? snowValue?.['3h'] ?? null : null,
    precipitation:
      point.precipitation
      ?? rain1h
      ?? rain3h
      ?? (point.pop === 0 ? 0 : null),
  };
}

function extractLocationMeta(data, lat, lon) {
  return {
    lat,
    lon,
    timezone: data.timezone ?? null,
    timezoneOffset: data.timezone_offset ?? null,
  };
}

function normalizeCurrentFromOneCall(data, lat, lon) {
  const point = data?.data?.[0] ?? {};
  const weather = extractWeather(point.weather);
  const rainSnow = extractRainSnow(point);

  return {
    scope: 'current',
    ...extractLocationMeta(data, lat, lon),
    temperature: point.temp,
    feelsLike: point.feels_like,
    ...weather,
    humidity: point.humidity,
    pressure: point.pressure,
    dewPoint: point.dew_point,
    uvi: point.uvi,
    clouds: point.clouds,
    visibility: point.visibility,
    windSpeedKmh: toKmh(point.wind_speed),
    windGustKmh: toKmh(point.wind_gust),
    windDeg: point.wind_deg,
    ...rainSnow,
    sunrise: point.sunrise,
    sunset: point.sunset,
    alertIds: point.alerts ?? [],
    updatedAt: point.dt,
    source: 'onecall_current',
  };
}

function normalizeCurrentFromLegacy(data, lat, lon) {
  const weather = extractWeather(data.weather);
  const rainSnow = extractRainSnow({
    rain: data.rain,
    snow: data.snow,
  });

  return {
    scope: 'current',
    lat,
    lon,
    timezone: null,
    timezoneOffset: null,
    temperature: data.main?.temp,
    feelsLike: data.main?.feels_like,
    ...weather,
    humidity: data.main?.humidity,
    pressure: data.main?.pressure,
    dewPoint: null,
    uvi: null,
    clouds: data.clouds?.all,
    visibility: data.visibility,
    windSpeedKmh: toKmh(data.wind?.speed),
    windGustKmh: toKmh(data.wind?.gust),
    windDeg: data.wind?.deg,
    ...rainSnow,
    sunrise: data.sys?.sunrise,
    sunset: data.sys?.sunset,
    alertIds: [],
    updatedAt: data.dt,
    city: data.name,
    country: data.sys?.country,
    source: 'weather_2_5',
  };
}

function normalizeTimelinePoint(scope, point) {
  const tempValue = point.temp;
  const isDailyTemp = tempValue != null && typeof tempValue === 'object';
  const feelsLikeValue = point.feels_like;
  const isDailyFeelsLike = feelsLikeValue != null && typeof feelsLikeValue === 'object';
  const weather = extractWeather(point.weather);
  const rainSnow = extractRainSnow(point);

  return {
    dt: point.dt,
    temp: isDailyTemp ? tempValue.day ?? tempValue.max : tempValue,
    feelsLike: isDailyFeelsLike ? feelsLikeValue.day : feelsLikeValue,
    feelsLikeDay: isDailyFeelsLike ? feelsLikeValue.day : null,
    feelsLikeNight: isDailyFeelsLike ? feelsLikeValue.night : null,
    feelsLikeMorn: isDailyFeelsLike ? feelsLikeValue.morn : null,
    feelsLikeEve: isDailyFeelsLike ? feelsLikeValue.eve : null,
    pop: point.pop,
    humidity: point.humidity,
    pressure: point.pressure,
    dewPoint: point.dew_point,
    uvi: point.uvi,
    clouds: point.clouds,
    windSpeedKmh: toKmh(point.wind_speed),
    windGustKmh: toKmh(point.wind_gust),
    windDeg: point.wind_deg,
    ...weather,
    ...rainSnow,
    tempMin: isDailyTemp ? tempValue.min : point.temp?.min,
    tempMax: isDailyTemp ? tempValue.max : point.temp?.max,
    tempDay: isDailyTemp ? tempValue.day : null,
    tempNight: isDailyTemp ? tempValue.night : null,
    tempMorn: isDailyTemp ? tempValue.morn : null,
    tempEve: isDailyTemp ? tempValue.eve : null,
    sunrise: point.sunrise,
    sunset: point.sunset,
    moonrise: point.moonrise,
    moonset: point.moonset,
    moonPhase: point.moon_phase,
    summary: point.summary ? capitalize(point.summary) : null,
    alertIds: point.alerts ?? [],
  };
}

function normalizeTimeline(scope, data, lat, lon) {
  return {
    scope,
    ...extractLocationMeta(data, lat, lon),
    points: (data.data ?? []).map((point) => normalizeTimelinePoint(scope, point)),
    source: `onecall_${scope}`,
  };
}

function localDayKey(dtSeconds, timezoneOffsetSeconds) {
  const localMs = dtSeconds * 1000 + timezoneOffsetSeconds * 1000;
  const localDate = new Date(localMs);

  const year = localDate.getUTCFullYear();
  const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(localDate.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function dayStartDt(dayKey, timezoneOffsetSeconds) {
  const [year, month, day] = dayKey.split('-').map(Number);
  const utcMs = Date.UTC(year, month - 1, day, 0, 0, 0) - timezoneOffsetSeconds * 1000;

  return Math.floor(utcMs / 1000);
}

export function aggregateForecastListToDaily(list, timezoneOffsetSeconds = 0) {
  const byDay = new Map();

  for (const item of list) {
    const dayKey = localDayKey(item.dt, timezoneOffsetSeconds);
    let bucket = byDay.get(dayKey);

    if (!bucket) {
      bucket = {
        dayKey,
        dt: dayStartDt(dayKey, timezoneOffsetSeconds),
        tempMin: Number.POSITIVE_INFINITY,
        tempMax: Number.NEGATIVE_INFINITY,
        pop: 0,
        rain3h: 0,
        slots: [],
      };
      byDay.set(dayKey, bucket);
    }

    bucket.tempMin = Math.min(bucket.tempMin, item.main?.temp_min ?? item.main?.temp ?? bucket.tempMin);
    bucket.tempMax = Math.max(bucket.tempMax, item.main?.temp_max ?? item.main?.temp ?? bucket.tempMax);
    bucket.pop = Math.max(bucket.pop, item.pop ?? 0);
    bucket.rain3h = Math.max(bucket.rain3h ?? 0, item.rain?.['3h'] ?? 0);
    bucket.slots.push(item);
  }

  return Array.from(byDay.values())
    .sort((left, right) => left.dt - right.dt)
    .map((bucket) => {
      const middaySlot = bucket.slots.reduce((best, item) => {
        const hour = new Date(item.dt * 1000 + timezoneOffsetSeconds * 1000).getUTCHours();
        const bestHour = best
          ? new Date(best.dt * 1000 + timezoneOffsetSeconds * 1000).getUTCHours()
          : -1;
        const distanceFromNoon = (value) => Math.abs(value - 12);

        return distanceFromNoon(hour) < distanceFromNoon(bestHour) ? item : best;
      }, null);

      return {
        dt: bucket.dt,
        temp: {
          day: middaySlot?.main?.temp ?? bucket.tempMax,
          min: bucket.tempMin,
          max: bucket.tempMax,
        },
        pop: bucket.pop,
        rain: bucket.rain3h > 0 ? { '3h': bucket.rain3h } : undefined,
        weather: middaySlot?.weather ?? [],
      };
    });
}

export function mergeUviIntoTimelinePoints(
  points,
  uviForecast,
  timezoneOffsetSeconds = 0,
  currentUvi = null,
) {
  const uviByDay = new Map();
  const todayKey = localDayKey(Math.floor(Date.now() / 1000), timezoneOffsetSeconds);

  for (const entry of uviForecast ?? []) {
    const dayKey = localDayKey(entry.date, timezoneOffsetSeconds);
    uviByDay.set(dayKey, entry.value);
  }

  return points.map((point) => {
    const dayKey = localDayKey(point.dt, timezoneOffsetSeconds);

    return {
      ...point,
      uvi:
        point.uvi
        ?? (dayKey === todayKey ? currentUvi : null)
        ?? uviByDay.get(dayKey)
        ?? null,
    };
  });
}

function normalizeForecast25ListItem(item) {
  return {
    dt: item.dt,
    temp: item.main?.temp,
    feels_like: item.main?.feels_like,
    humidity: item.main?.humidity,
    pressure: item.main?.pressure,
    dew_point: item.main?.dew_point,
    clouds: item.clouds?.all,
    visibility: item.visibility,
    wind_speed: item.wind?.speed,
    wind_gust: item.wind?.gust,
    wind_deg: item.wind?.deg,
    pop: item.pop,
    rain: item.rain,
    snow: item.snow,
    weather: item.weather,
  };
}

function normalizeHourlyFromForecast25(data, lat, lon) {
  const timezoneOffset = data.city?.timezone ?? 0;

  return {
    scope: 'hourly',
    lat,
    lon,
    timezone: null,
    timezoneOffset,
    points: (data.list ?? [])
      .slice(0, 40)
      .map((item) => normalizeTimelinePoint('hourly', normalizeForecast25ListItem(item))),
    source: 'forecast_2_5_hourly',
  };
}

function normalizeDailyFromForecastDaily16(data, lat, lon) {
  const timezoneOffset = data.city?.timezone ?? 0;

  return {
    scope: 'daily',
    lat,
    lon,
    timezone: null,
    timezoneOffset,
    points: (data.list ?? []).map((point) => normalizeTimelinePoint('daily', point)),
    source: 'forecast_2_5_daily_16',
  };
}

function normalizeDailyFromForecast25(data, lat, lon) {
  const timezoneOffset = data.city?.timezone ?? 0;
  const dailyPoints = aggregateForecastListToDaily(data.list ?? [], timezoneOffset);

  return {
    scope: 'daily',
    lat,
    lon,
    timezone: null,
    timezoneOffset,
    points: dailyPoints.map((point) => normalizeTimelinePoint('daily', point)),
    source: 'forecast_2_5_daily',
  };
}

export function normalizeWeatherResponse({ scope, data, lat, lon, source }) {
  if (scope === 'current' && source === 'onecall_current') {
    return normalizeCurrentFromOneCall(data, lat, lon);
  }

  if (scope === 'current' && source === 'weather_2_5') {
    return normalizeCurrentFromLegacy(data, lat, lon);
  }

  if (['hourly', 'daily', 'minutely'].includes(scope)) {
    if (source === 'onecall_3_timeline') {
      const arrayKey = scope;

      return {
        scope,
        ...extractLocationMeta(data, lat, lon),
        points: (data[arrayKey] ?? []).map((point) => normalizeTimelinePoint(scope, point)),
        source: `onecall_3_${scope}`,
      };
    }

    if (scope === 'daily' && source === 'forecast_2_5') {
      return normalizeDailyFromForecast25(data, lat, lon);
    }

    if (scope === 'daily' && source === 'forecast_2_5_daily_16') {
      return normalizeDailyFromForecastDaily16(data, lat, lon);
    }

    if (scope === 'hourly' && source === 'forecast_2_5') {
      return normalizeHourlyFromForecast25(data, lat, lon);
    }

    return normalizeTimeline(scope, data, lat, lon);
  }

  return { scope, lat, lon, raw: data, source };
}

export function normalizeGeocodeResults(results) {
  return results.map((item) => ({
    name: item.name,
    country: item.country,
    state: item.state ?? null,
    county: item.county ?? null,
    lat: item.lat,
    lon: item.lon,
    label: [item.name, item.county, item.state, item.country].filter(Boolean).join(', '),
  }));
}

export function normalizeAlert(data) {
  return {
    id: data.id,
    senderName: data.sender_name,
    event: data.event,
    start: data.start,
    end: data.end,
    description: data.description,
    tags: data.tags ?? [],
  };
}
