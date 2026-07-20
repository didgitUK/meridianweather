import {
  WEATHER_CHECK_CACHE_OUTCOMES,
  WEATHER_CHECK_TRIGGERS,
  mapCacheLayerToOutcome,
  normalizeWeatherCheckTrigger,
  resolveSnapshotTtlClass,
} from '@/constants/weather-check-triggers';
import { WEATHER_PLACE_SEO_MAX_AGE_MS } from '@/constants/weather-places';
import {
  canMakeUpstreamCall,
  trackUpstreamCall,
} from '@/lib/api-usage-tracker';
import { cacheMeetsMaxAge, resolveScopeMaxAgeMs } from '@/lib/weather-cache-age';
import { buildSnapshotKey } from '@/lib/weather-snapshot-repo';
import { recordServedWeatherCheck } from '@/lib/location-repo';
import { readFromCaches, wrapSnapshot } from '@/lib/weather/cache-policy';
import { persistAndReturn } from '@/lib/weather/persist';
import { TARGET_DAILY_FORECAST_DAYS } from '@/lib/weather/daily-horizon';
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

function resolveMaxAgeMs(options = {}, scope, trigger) {
  const explicit = resolveScopeMaxAgeMs(options.maxAgeMs, scope);
  if (explicit != null) {
    return explicit;
  }

  if (trigger === WEATHER_CHECK_TRIGGERS.weatherPlaceSeo) {
    return WEATHER_PLACE_SEO_MAX_AGE_MS;
  }

  return null;
}

function resolveUsableCached(cached, maxAgeMs) {
  if (!cached) {
    return null;
  }

  if (!cached.emergency) {
    return cached;
  }

  if (
    maxAgeMs
    && cacheMeetsMaxAge({ meta: { fetchedAt: cached.emergency.fetchedAt } }, maxAgeMs)
  ) {
    return wrapSnapshot(cached.emergency, 'database', 'acceptable');
  }

  return cached;
}

function recordCurrentCheckFromResponse(lat, lon, scope, response, trigger) {
  if (scope !== 'current' || !response?.data) {
    return;
  }

  const cacheLayer = response.meta?.cacheLayer ?? 'upstream';
  const cacheOutcome = mapCacheLayerToOutcome(cacheLayer);
  const tokensUsed = cacheOutcome === WEATHER_CHECK_CACHE_OUTCOMES.upstream ? 1 : 0;
  // Cache serves are not new lookups — only upstream spends quota and counts as a check.
  const willRecord = cacheOutcome === WEATHER_CHECK_CACHE_OUTCOMES.upstream;

  if (!willRecord) {
    return;
  }

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
  const maxAgeMs = resolveMaxAgeMs(options, scope, trigger);
  const ttlClass = resolveSnapshotTtlClass(trigger);
  const cacheKey = buildSnapshotKey(lat, lon, scope, lang, ttlClass);
  const rawCached = readFromCaches(cacheKey, { trigger, lat, lon, scope });
  const cached = resolveUsableCached(rawCached, maxAgeMs);
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
  const cachedNeedsDailyHorizon =
    scope === 'daily'
    && Array.isArray(cached?.data?.points)
    && cached.data.points.length > 0
    && cached.data.points.length < TARGET_DAILY_FORECAST_DAYS;
  const cachedIsUsable =
    cached
    && !cached.emergency
    && cachedHasTimelinePoints
    && !cachedNeedsLegacySupplement
    && !cachedNeedsTimelineEnrichment
    && !cachedNeedsDailyHorizon;
  const cachedIsFreshEnough = cacheMeetsMaxAge(cached, maxAgeMs);

  if (cachedIsUsable && cachedIsFreshEnough) {
    recordCurrentCheckFromResponse(lat, lon, scope, cached, trigger);
    return cached;
  }

  if (!canMakeUpstreamCall()) {
    if (rawCached?.emergency) {
      const emergency = wrapSnapshot(rawCached.emergency, 'database', 'emergency');
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
    const usageMeta = enrichUsageMeta(lat, lon, scope, trigger);
    const tracked = await trackUpstreamCall(
      scope === 'current' ? 'onecall_current' : `onecall_${scope}`,
      () => (scope === 'current'
        ? fetchCurrentFromUpstream(lat, lon, lang, usageMeta)
        : fetchScopedFromUpstream(lat, lon, scope, lang, usageMeta)),
      usageMeta,
    );

    if (tracked.blocked) {
      if (rawCached?.emergency) {
        const emergency = wrapSnapshot(rawCached.emergency, 'database', 'emergency');
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
