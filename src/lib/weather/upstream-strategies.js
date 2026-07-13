import { fetchOpenWeather, getApiKey } from '@/lib/api-client';
import {
  mergeUviIntoTimelinePoints,
  normalizeWeatherResponse,
} from '@/lib/one-call';
import {
  fetchCurrentUvi,
  fetchForecast25Data,
  fetchForecastDaily16Data,
  fetchUviForecast,
  supplementLegacyCurrent,
} from '@/lib/weather-2-5-supplement';

async function fetchCurrentWeather(lat, lon, lang = 'en') {
  const key = getApiKey();
  const oneCallUrl = `https://api.openweathermap.org/data/4.0/onecall/current?lat=${lat}&lon=${lon}&units=metric&lang=${lang}&appid=${key}`;

  try {
    const { data, durationMs } = await fetchOpenWeather(oneCallUrl, {
      endpoint: 'onecall_current',
    });
    return {
      payload: normalizeWeatherResponse({
        scope: 'current',
        data,
        lat,
        lon,
        source: 'onecall_current',
      }),
      source: 'onecall_current',
      durationMs,
    };
  } catch {
    const legacyUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=${lang}&appid=${key}`;
    const { data, durationMs } = await fetchOpenWeather(legacyUrl, {
      endpoint: 'weather_2_5',
    });
    return {
      payload: await supplementLegacyCurrent(
        normalizeWeatherResponse({
          scope: 'current',
          data,
          lat,
          lon,
          source: 'weather_2_5',
        }),
        lat,
        lon,
      ),
      source: 'weather_2_5',
      durationMs,
    };
  }
}

async function fetchScopedWeatherFromOneCall4(lat, lon, scope, lang = 'en') {
  const key = getApiKey();
  const pathMap = {
    hourly: 'timeline/1h',
    daily: 'timeline/1day',
    minutely: 'timeline/1min',
  };

  const limits = {
    hourly: 168,
    daily: 10,
    minutely: 60,
  };

  const path = pathMap[scope];
  const initialUrl = `https://api.openweathermap.org/data/4.0/onecall/${path}?lat=${lat}&lon=${lon}&units=metric&lang=${lang}&appid=${key}`;

  let combined = null;
  let nextUrl = initialUrl;
  const points = [];

  while (nextUrl && points.length < limits[scope]) {
    const { data } = await fetchOpenWeather(nextUrl, {
      endpoint: `onecall_${scope}`,
    });

    combined = data;
    points.push(...(data.data ?? []));
    nextUrl = data.next ?? null;

    if (!data.next) {
      break;
    }
  }

  const payload = normalizeWeatherResponse({
    scope,
    data: {
      ...combined,
      data: points.slice(0, limits[scope]),
    },
    lat,
    lon,
    source: `onecall_${scope}`,
  });

  return {
    payload,
    source: `onecall_${scope}`,
    durationMs: 0,
  };
}

async function fetchScopedWeatherFromOneCall3(lat, lon, scope, lang = 'en') {
  const key = getApiKey();
  const limits = {
    hourly: 168,
    daily: 10,
    minutely: 60,
  };
  const excludeMap = {
    hourly: 'current,minutely,daily,alerts',
    daily: 'current,minutely,hourly,alerts',
    minutely: 'current,hourly,daily,alerts',
  };

  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&lang=${lang}&exclude=${excludeMap[scope]}&appid=${key}`;
  const { data } = await fetchOpenWeather(url, { endpoint: `onecall_3_${scope}` });

  const payload = normalizeWeatherResponse({
    scope,
    data: {
      ...data,
      [scope]: (data[scope] ?? []).slice(0, limits[scope]),
    },
    lat,
    lon,
    source: 'onecall_3_timeline',
  });

  if (!payload.points?.length) {
    throw new Error(`No ${scope} forecast data returned`);
  }

  return {
    payload,
    source: `onecall_3_${scope}`,
    durationMs: 0,
  };
}

async function fetchDailyFromForecast25(lat, lon) {
  const [daily16Data, uviForecast, currentUvi] = await Promise.all([
    fetchForecastDaily16Data(lat, lon).catch(() => null),
    fetchUviForecast(lat, lon),
    fetchCurrentUvi(lat, lon),
  ]);

  if (daily16Data?.list?.length) {
    const payload = normalizeWeatherResponse({
      scope: 'daily',
      data: daily16Data,
      lat,
      lon,
      source: 'forecast_2_5_daily_16',
    });

    const enrichedPayload = {
      ...payload,
      points: mergeUviIntoTimelinePoints(
        payload.points,
        uviForecast,
        payload.timezoneOffset ?? 0,
        currentUvi,
      ),
    };

    if (enrichedPayload.points?.length) {
      return {
        payload: enrichedPayload,
        source: 'forecast_2_5_daily_16',
        durationMs: 0,
      };
    }
  }

  const data = await fetchForecast25Data(lat, lon);
  const payload = normalizeWeatherResponse({
    scope: 'daily',
    data,
    lat,
    lon,
    source: 'forecast_2_5',
  });

  const enrichedPayload = {
    ...payload,
    points: mergeUviIntoTimelinePoints(
      payload.points,
      uviForecast,
      payload.timezoneOffset ?? 0,
      currentUvi,
    ),
  };

  if (!enrichedPayload.points?.length) {
    throw new Error('No daily forecast data returned');
  }

  return {
    payload: enrichedPayload,
    source: 'forecast_2_5_daily',
    durationMs: 0,
  };
}

async function fetchHourlyFromForecast25(lat, lon) {
  const [data, uviForecast, currentUvi] = await Promise.all([
    fetchForecast25Data(lat, lon),
    fetchUviForecast(lat, lon),
    fetchCurrentUvi(lat, lon),
  ]);
  const payload = normalizeWeatherResponse({
    scope: 'hourly',
    data,
    lat,
    lon,
    source: 'forecast_2_5',
  });

  const enrichedPayload = {
    ...payload,
    points: mergeUviIntoTimelinePoints(
      payload.points,
      uviForecast,
      payload.timezoneOffset ?? 0,
      currentUvi,
    ),
  };

  if (!enrichedPayload.points?.length) {
    throw new Error('No hourly forecast data returned');
  }

  return {
    payload: enrichedPayload,
    source: 'forecast_2_5_hourly',
    durationMs: 0,
  };
}

/**
 * Run upstream strategies in order until one returns usable data.
 */
export async function runUpstreamStrategies(strategies) {
  let lastError = null;

  for (const strategy of strategies) {
    try {
      const result = await strategy();
      if (result?.payload) {
        return result;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('No upstream weather strategy succeeded');
}

export async function fetchCurrentFromUpstream(lat, lon, lang = 'en') {
  return fetchCurrentWeather(lat, lon, lang);
}

export async function fetchScopedFromUpstream(lat, lon, scope, lang = 'en') {
  return runUpstreamStrategies([
    async () => {
      const oneCall4 = await fetchScopedWeatherFromOneCall4(lat, lon, scope, lang);
      if (!oneCall4.payload.points?.length) {
        throw new Error(`No ${scope} forecast data from One Call 4.0`);
      }
      return oneCall4;
    },
    () => fetchScopedWeatherFromOneCall3(lat, lon, scope, lang),
    async () => {
      if (scope === 'daily') {
        return fetchDailyFromForecast25(lat, lon);
      }
      if (scope === 'hourly') {
        return fetchHourlyFromForecast25(lat, lon);
      }
      throw new Error(`No ${scope} forecast data returned`);
    },
  ]);
}
