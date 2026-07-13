import { fetchOpenWeather, getApiKey } from '@/lib/api-client';
import { trackUpstreamCall } from '@/lib/api-usage-tracker';

const forecast25Cache = new Map();
const uviForecastCache = new Map();

function locationCacheKey(lat, lon) {
  return `${Number(lat).toFixed(3)},${Number(lon).toFixed(3)}`;
}

export function clearWeather25CachesForTests() {
  forecast25Cache.clear();
  uviForecastCache.clear();
}

export async function fetchForecastDaily16Data(lat, lon) {
  const cacheKey = `${locationCacheKey(lat, lon)}:daily16`;

  if (forecast25Cache.has(cacheKey)) {
    return forecast25Cache.get(cacheKey);
  }

  const key = getApiKey();
  const urls = [
    `https://pro.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=16&units=metric&lang=en&appid=${key}`,
    `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=16&units=metric&lang=en&appid=${key}`,
  ];

  const promise = (async () => {
    for (const url of urls) {
      try {
        const tracked = await trackUpstreamCall(
          'forecast_daily_16',
          () => fetchOpenWeather(url, { endpoint: 'forecast_daily_16' }),
          { lat, lon },
        );

        if (tracked.blocked) {
          throw new Error('Weather updates are paused until quota resets');
        }

        if (tracked.result.data?.list?.length) {
          return tracked.result.data;
        }
      } catch {
        // Try the next daily forecast endpoint.
      }
    }

    return null;
  })();

  forecast25Cache.set(cacheKey, promise);

  try {
    return await promise;
  } catch (error) {
    forecast25Cache.delete(cacheKey);
    throw error;
  }
}

export async function fetchForecast25Data(lat, lon) {
  const cacheKey = locationCacheKey(lat, lon);

  if (forecast25Cache.has(cacheKey)) {
    return forecast25Cache.get(cacheKey);
  }

  const key = getApiKey();
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=en&appid=${key}`;

  const promise = trackUpstreamCall(
    'forecast_2_5',
    () => fetchOpenWeather(url, { endpoint: 'forecast_2_5' }),
    { lat, lon },
  ).then((tracked) => {
    if (tracked.blocked) {
      throw new Error('Weather updates are paused until quota resets');
    }

    return tracked.result.data;
  });

  forecast25Cache.set(cacheKey, promise);

  try {
    return await promise;
  } catch (error) {
    forecast25Cache.delete(cacheKey);
    throw error;
  }
}

export async function fetchCurrentUvi(lat, lon) {
  const key = getApiKey();
  const url = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${key}`;

  const tracked = await trackUpstreamCall(
    'uvi_current',
    () => fetchOpenWeather(url, { endpoint: 'uvi_current' }),
    { lat, lon },
  );

  if (tracked.blocked) {
    return null;
  }

  return tracked.result.data?.value ?? null;
}

export async function fetchUviForecast(lat, lon) {
  const cacheKey = locationCacheKey(lat, lon);

  if (uviForecastCache.has(cacheKey)) {
    return uviForecastCache.get(cacheKey);
  }

  const key = getApiKey();
  const url = `https://api.openweathermap.org/data/2.5/uvi/forecast?lat=${lat}&lon=${lon}&appid=${key}`;

  const promise = trackUpstreamCall(
    'uvi_forecast',
    () => fetchOpenWeather(url, { endpoint: 'uvi_forecast' }),
    { lat, lon },
  ).then((tracked) => {
    if (tracked.blocked) {
      return [];
    }

    return tracked.result.data ?? [];
  });

  uviForecastCache.set(cacheKey, promise);

  try {
    return await promise;
  } catch {
    uviForecastCache.delete(cacheKey);
    return [];
  }
}

export function findNearestForecastSlot(list, timestamp = null) {
  if (!list?.length) {
    return null;
  }

  const target = timestamp ?? Math.floor(Date.now() / 1000);

  return list.reduce((best, item) => {
    if (!best) {
      return item;
    }

    const bestDelta = Math.abs(best.dt - target);
    const itemDelta = Math.abs(item.dt - target);

    return itemDelta < bestDelta ? item : best;
  }, null);
}

export async function supplementLegacyCurrent(payload, lat, lon, deps = {}) {
  const loadUvi = deps.fetchCurrentUvi ?? fetchCurrentUvi;
  const loadForecast = deps.fetchForecast25Data ?? fetchForecast25Data;

  const [uvi, forecastData] = await Promise.all([
    loadUvi(lat, lon),
    loadForecast(lat, lon).catch(() => null),
  ]);

  const nearest = findNearestForecastSlot(forecastData?.list, payload.updatedAt);
  const rain3h = nearest?.rain?.['3h'] ?? null;
  const dryWindow = nearest?.pop === 0 && rain3h == null;

  return {
    ...payload,
    uvi: payload.uvi ?? uvi,
    dewPoint: payload.dewPoint ?? nearest?.main?.dew_point ?? null,
    timezoneOffset: payload.timezoneOffset ?? forecastData?.city?.timezone ?? null,
    rain1h: payload.rain1h ?? rain3h ?? (dryWindow ? 0 : null),
    rain3h: payload.rain3h ?? rain3h ?? (dryWindow ? 0 : null),
    precipitation: payload.precipitation ?? rain3h ?? (dryWindow ? 0 : null),
  };
}
