import {
  WEATHER_CHECK_CACHE_OUTCOMES,
  WEATHER_CHECK_TRIGGERS,
  mapCacheLayerToOutcome,
  normalizeWeatherCheckTrigger,
} from '@/constants/weather-check-triggers';
import {
  canMakeUpstreamCall,
  recordCacheHit,
  trackUpstreamCall,
} from '@/lib/api-usage-tracker';
import { cacheMeetsMaxAge, resolveScopeMaxAgeMs } from '@/lib/weather-cache-age';
import { buildSnapshotKey } from '@/lib/weather-snapshot-repo';
import { recordServedWeatherCheck } from '@/lib/location-repo';
import { readFromCaches, wrapSnapshot } from '@/lib/weather/cache-policy';
import { persistAndReturn } from '@/lib/weather/persist';
import {
  fetchCurrentFromUpstream,
  fetchScopedFromUpstream,
} from '@/lib/weather/upstream-strategies';

const pendingFetches = new Map();

function resolveWeatherLang(options = {}) {
  const lang = options.lang ?? 'en';
  return typeof lang === 'string' && lang.length > 0 ? lang : 'en';
}

function resolveTrigger(options = {}) {
  return normalizeWeatherCheckTrigger(options.trigger);
}

function recordCurrentCheckFromResponse(lat, lon, scope, response, trigger) {
  if (scope !== 'current' || !response?.data) {
    return;
  }

  const cacheLayer = response.meta?.cacheLayer ?? 'upstream';
  const cacheOutcome = mapCacheLayerToOutcome(cacheLayer);
  const tokensUsed = cacheOutcome === WEATHER_CHECK_CACHE_OUTCOMES.upstream ? 1 : 0;

  recordServedWeatherCheck({
    lat,
    lon,
    scope,
    payload: response.data,
    source: response.meta?.source ?? response.data?.source ?? 'unknown',
    trigger,
    cacheOutcome,
    tokensUsed,
  });
}

function enrichUsageMeta(lat, lon, scope, trigger, extra = {}) {
  return {
    lat,
    lon,
    scope,
    trigger,
    ...extra,
  };
}

export async function fetchWeatherForScope(lat, lon, scope = 'current', options = {}) {
  const lang = resolveWeatherLang(options);
  const trigger = resolveTrigger(options);
  const maxAgeMs = resolveScopeMaxAgeMs(options.maxAgeMs, scope);
  const cacheKey = buildSnapshotKey(lat, lon, scope, lang);
  const cached = readFromCaches(cacheKey, { trigger, lat, lon, scope });
  const cachedHasTimelinePoints =
    !['hourly', 'daily', 'minutely'].includes(scope) || (cached?.data?.points?.length ?? 0) > 0;
  const cachedNeedsLegacySupplement =
    scope === 'current'
    && cached?.data?.source === 'weather_2_5'
    && cached.data.uvi == null;
  const cachedNeedsTimelineEnrichment =
    ['hourly', 'daily'].includes(scope)
    && cached?.data?.source?.startsWith('forecast_2_5')
    && cached.data.points?.some((point) => point.uvi == null);
  const cachedIsUsable =
    cached
    && !cached.emergency
    && cachedHasTimelinePoints
    && !cachedNeedsLegacySupplement
    && !cachedNeedsTimelineEnrichment;
  const cachedIsFreshEnough = cacheMeetsMaxAge(cached, maxAgeMs);

  if (cachedIsUsable && cachedIsFreshEnough) {
    recordCurrentCheckFromResponse(lat, lon, scope, cached, trigger);
    return cached;
  }

  if (!canMakeUpstreamCall()) {
    if (cached?.emergency) {
      const emergency = wrapSnapshot(cached.emergency, 'database', 'emergency');
      recordCurrentCheckFromResponse(lat, lon, scope, emergency, trigger);
      return emergency;
    }

    if (cachedIsUsable) {
      recordCurrentCheckFromResponse(lat, lon, scope, cached, trigger);
      return cached;
    }

    throw new Error('Weather updates are paused until quota resets');
  }

  if (pendingFetches.has(cacheKey)) {
    return pendingFetches.get(cacheKey);
  }

  const promise = (async () => {
    const tracked = await trackUpstreamCall(
      scope === 'current' ? 'onecall_current' : `onecall_${scope}`,
      () => (scope === 'current'
        ? fetchCurrentFromUpstream(lat, lon, lang)
        : fetchScopedFromUpstream(lat, lon, scope, lang)),
      enrichUsageMeta(lat, lon, scope, trigger),
    );

    if (tracked.blocked) {
      if (cached?.emergency) {
        const emergency = wrapSnapshot(cached.emergency, 'database', 'emergency');
        recordCurrentCheckFromResponse(lat, lon, scope, emergency, trigger);
        return emergency;
      }
      if (cachedIsUsable) {
        recordCurrentCheckFromResponse(lat, lon, scope, cached, trigger);
        return cached;
      }
      throw new Error('Weather updates are paused until quota resets');
    }

    const payload = tracked.result.payload;
    if (['hourly', 'daily', 'minutely'].includes(scope) && !payload.points?.length) {
      throw new Error(`No ${scope} forecast data returned`);
    }

    return persistAndReturn({
      lat,
      lon,
      scope,
      cacheKey,
      payload: tracked.result.payload,
      source: tracked.result.source,
      trigger,
      tokensUsed: 1,
    });
  })();

  pendingFetches.set(cacheKey, promise);
  try {
    return await promise;
  } finally {
    pendingFetches.delete(cacheKey);
  }
}

export async function fetchWeatherBatch(cities, options = {}) {
  const results = [];
  const batchTrigger = resolveTrigger(options);

  for (const city of cities) {
    const scopes = city.scopes ?? ['current'];
    const cityResult = { lat: city.lat, lon: city.lon, scopes: {} };
    const trigger = resolveTrigger({
      trigger: city.trigger ?? batchTrigger,
    });

    for (const scope of scopes) {
      try {
        const response = await fetchWeatherForScope(city.lat, city.lon, scope, {
          maxAgeMs: city.maxAgeMs,
          lang: city.lang ?? options.lang,
          trigger,
        });
        cityResult.scopes[scope] = response;
      } catch (error) {
        cityResult.scopes[scope] = {
          error: error.message,
        };
      }
    }

    results.push(cityResult);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return { cities: results };
}

// Re-export for tests / callers that need the default unknown constant.
export { WEATHER_CHECK_TRIGGERS };
