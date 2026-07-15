import { getApiKey, fetchOpenWeather } from '@/lib/api-client';
import {
  canMakeUpstreamCall,
  trackUpstreamCall,
} from '@/lib/api-usage-tracker';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';

const reverseCache = new Map();

export function createReverseGeocodeLookup() {
  return async function reverseGeocodeLookup(lat, lon) {
    const cacheKey = `${Number(lat).toFixed(3)},${Number(lon).toFixed(3)}`;

    if (reverseCache.has(cacheKey)) {
      return reverseCache.get(cacheKey);
    }

    if (!canMakeUpstreamCall()) {
      return null;
    }

    const key = getApiKey();
    const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${key}`;

    const tracked = await trackUpstreamCall(
      'geocode_reverse',
      () => fetchOpenWeather(url, { endpoint: 'geocode_reverse' }),
      {
        lat,
        lon,
        trigger: WEATHER_CHECK_TRIGGERS.geocodeReverse,
        reason: 'reverse_geocode_lookup',
      },
    );

    if (tracked.blocked) {
      return null;
    }

    const result = tracked.result.data?.[0] ?? null;
    reverseCache.set(cacheKey, result);
    return result;
  };
}

export function clearReverseGeocodeCacheForTests() {
  reverseCache.clear();
}
