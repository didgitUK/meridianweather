import { SCOPE_TTL } from '@/constants/weather';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { isFunctionalConsentGranted } from '@/lib/consent-storage';
import {
  loadWeatherBatch,
  persistBatchScopes,
} from '@/features/weather/utils/weather-batch-client';
import {
  readLocalWeatherCache,
  writeLocalWeatherCache,
} from '@/features/weather/utils/weather-cache';
import {
  buildPriorityCities,
  syncPriorityCitiesToServiceWorker,
} from '@/features/pwa/priority-cities-store';
import { cacheMeetsMaxAge } from '@/lib/weather-cache-age';

const PREFETCH_SCOPES = ['current', 'daily'];
const PREFETCH_MAX_AGE_MS = {
  current: SCOPE_TTL.current.fresh,
  daily: SCOPE_TTL.daily.fresh,
};

let inflight = null;

function cityNeedsRefresh(city) {
  return PREFETCH_SCOPES.some((scope) => {
    const cached = readLocalWeatherCache(city.id, scope);
    if (!cached?.payload) {
      return true;
    }
    return !cacheMeetsMaxAge(
      { meta: { fetchedAt: cached.fetchedAt ?? null } },
      PREFETCH_MAX_AGE_MS[scope],
    );
  });
}

/**
 * Prefetch current + daily for pinned and recent cities; sync list for background SW.
 */
export async function prefetchPriorityCities({
  savedCities,
  force = false,
  trigger = WEATHER_CHECK_TRIGGERS.pwaPrefetch,
  lang,
} = {}) {
  if (typeof window === 'undefined') {
    return { cities: [], refreshed: 0 };
  }

  if (!navigator.onLine) {
    const cities = buildPriorityCities({ savedCities });
    await syncPriorityCitiesToServiceWorker(cities);
    return { cities, refreshed: 0, offline: true };
  }

  if (inflight) {
    return inflight;
  }

  inflight = (async () => {
    const cities = buildPriorityCities({ savedCities });
    await syncPriorityCitiesToServiceWorker(cities);

    if (!isFunctionalConsentGranted() || cities.length === 0) {
      return { cities, refreshed: 0 };
    }

    const toFetch = force ? cities : cities.filter(cityNeedsRefresh);
    if (toFetch.length === 0) {
      return { cities, refreshed: 0 };
    }

    try {
      const payload = await loadWeatherBatch(
        toFetch.map((city) => ({
          lat: city.lat,
          lon: city.lon,
          scopes: PREFETCH_SCOPES,
          maxAgeMs: PREFETCH_MAX_AGE_MS,
          trigger,
          ...(lang ? { lang } : {}),
        })),
        { trigger, lang },
      );

      payload.cities?.forEach((entry, index) => {
        const city = toFetch[index];
        if (!city || !entry) {
          return;
        }
        persistBatchScopes(entry, PREFETCH_SCOPES, (scope, cachePayload) => {
          writeLocalWeatherCache(city.id, scope, cachePayload);
        });
      });

      return { cities, refreshed: toFetch.length };
    } catch {
      return { cities, refreshed: 0, error: true };
    }
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

/**
 * Apply a background batch payload (from SW postMessage) into L0.
 */
export function applyBackgroundWeatherBatch({ batch, requestCities }) {
  if (!batch?.cities || !Array.isArray(requestCities)) {
    return;
  }

  batch.cities.forEach((entry, index) => {
    const city = requestCities[index];
    if (!city?.id || !entry) {
      return;
    }
    persistBatchScopes(entry, PREFETCH_SCOPES, (scope, cachePayload) => {
      writeLocalWeatherCache(city.id, scope, cachePayload);
    });
  });
}
