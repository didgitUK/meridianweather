import { STORAGE_KEYS } from '@/constants/storage-keys';
import { isFunctionalConsentGranted } from '@/lib/consent-storage';
import {
  loadWeatherBatchForCity,
  persistBatchScopes,
} from '@/features/weather/utils/weather-batch-client';

/** Session L0 — survives remounts without functional consent; not persisted. */
const sessionWeatherCache = new Map();

function sessionCacheKey(cityId, scope) {
  return `${cityId}::${scope}`;
}

export function readLocalWeatherCache(cityId, scope) {
  const sessionHit = sessionWeatherCache.get(sessionCacheKey(cityId, scope));
  if (sessionHit) {
    return sessionHit;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.weatherCache);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const entry = parsed?.[cityId]?.[scope] ?? null;
    if (entry) {
      sessionWeatherCache.set(sessionCacheKey(cityId, scope), entry);
    }
    return entry;
  } catch {
    return null;
  }
}

export function writeLocalWeatherCache(cityId, scope, payload) {
  sessionWeatherCache.set(sessionCacheKey(cityId, scope), payload);

  if (!isFunctionalConsentGranted()) {
    return;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.weatherCache);
    const parsed = raw ? JSON.parse(raw) : {};
    const previous = parsed?.[cityId]?.[scope] ?? null;

    // Skip identical rewrites — weather cache is intentionally silent (no
    // meridian:storage) so churn here must not fan out unrelated listeners.
    try {
      if (previous && JSON.stringify(previous) === JSON.stringify(payload)) {
        return;
      }
    } catch {
      // Fall through and write.
    }

    parsed[cityId] = parsed[cityId] ?? {};
    parsed[cityId][scope] = payload;
    window.localStorage.setItem(STORAGE_KEYS.weatherCache, JSON.stringify(parsed));
  } catch {
    // Ignore storage failures.
  }
}

export function clearWeatherCacheForCity(cityId) {
  for (const key of sessionWeatherCache.keys()) {
    if (key.startsWith(`${cityId}::`)) {
      sessionWeatherCache.delete(key);
    }
  }

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
  lang,
}) {
  try {
    const entry = await loadWeatherBatchForCity({ lat, lon, scopes, trigger, lang });
    if (!entry) return null;

    persistBatchScopes(entry, scopes, (scope, payload) => {
      writeLocalWeatherCache(cityId, scope, payload);
    });
    return entry;
  } catch {
    return null;
  }
}
