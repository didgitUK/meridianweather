import { STORAGE_KEYS } from '@/constants/storage-keys';
import { isFunctionalConsentGranted } from '@/lib/consent-storage';
import {
  loadWeatherBatchForCity,
  persistBatchScopes,
} from '@/features/weather/utils/weather-batch-client';

export function readLocalWeatherCache(cityId, scope) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.weatherCache);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.[cityId]?.[scope] ?? null;
  } catch {
    return null;
  }
}

export function writeLocalWeatherCache(cityId, scope, payload) {
  if (!isFunctionalConsentGranted()) {
    return;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.weatherCache);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[cityId] = parsed[cityId] ?? {};
    parsed[cityId][scope] = payload;
    window.localStorage.setItem(STORAGE_KEYS.weatherCache, JSON.stringify(parsed));
  } catch {
    // Ignore storage failures.
  }
}

export function clearWeatherCacheForCity(cityId) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.weatherCache);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    delete parsed[cityId];
    window.localStorage.setItem(STORAGE_KEYS.weatherCache, JSON.stringify(parsed));
  } catch {
    // Ignore storage failures.
  }
}

export async function prefetchWeatherBatch({
  lat,
  lon,
  cityId,
  scopes = ['current'],
  trigger,
}) {
  try {
    const entry = await loadWeatherBatchForCity({ lat, lon, scopes, trigger });
    if (!entry) return null;

    persistBatchScopes(entry, scopes, (scope, payload) => {
      writeLocalWeatherCache(cityId, scope, payload);
    });
    return entry;
  } catch {
    return null;
  }
}
