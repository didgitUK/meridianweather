import {
  enrichAndDedupeGeocodeResults,
} from '@/lib/geocode-enrichment';
import { createReverseGeocodeLookup } from '@/lib/geocode-reverse';
import {
  GEOCODE_RESULT_LIMIT,
  mergeAndRankGeocodeResults,
  rerankGeocodeResults,
  searchPopularCities,
} from '@/lib/geocode-ranking';
import { fetchOpenWeather, getApiKey } from '@/lib/api-client';
import {
  canMakeUpstreamCall,
  trackUpstreamCall,
} from '@/lib/api-usage-tracker';
import { normalizeGeocodeResults } from '@/lib/one-call';
import { buildSnapshotKey } from '@/lib/weather-snapshot-repo';
import { readFromCaches, wrapSnapshot } from '@/lib/weather/cache-policy';
import { persistAndReturn } from '@/lib/weather/persist';

const reverseGeocodeLookup = createReverseGeocodeLookup();

async function finalizeGeocodeResults(results, query, context) {
  return enrichAndDedupeGeocodeResults(results, query, context, {
    reverseLookup: reverseGeocodeLookup,
  });
}

export async function fetchGeocode(query, context = null) {
  const normalized = query.trim().toLowerCase();
  const cacheKey = buildSnapshotKey(normalized, null, 'geocode');
  const cached = readFromCaches(cacheKey);

  if (cached && !cached.emergency) {
    const results = rerankGeocodeResults(cached.data.results ?? [], query, context);
    const finalizedResults = await finalizeGeocodeResults(results, query, context);

    return {
      data: { results: finalizedResults },
      meta: {
        ...cached.meta,
        cacheLayer: cached.meta?.cacheLayer ?? 'database',
        freshness: cached.meta?.freshness ?? 'acceptable',
      },
    };
  }

  const localResults = searchPopularCities(query, GEOCODE_RESULT_LIMIT);

  function popularFallback(cacheLayer = 'popular', freshness = 'fresh') {
    const offlineResults = mergeAndRankGeocodeResults(
      query,
      localResults,
      [],
      GEOCODE_RESULT_LIMIT,
      context,
    );

    return {
      data: { results: offlineResults },
      meta: { cacheLayer, freshness },
    };
  }

  if (!canMakeUpstreamCall()) {
    if (cached?.emergency) {
      const results = rerankGeocodeResults(cached.emergency.payload.results ?? [], query, context);
      return wrapSnapshot({ ...cached.emergency, payload: { results } }, 'database', 'emergency');
    }

    return popularFallback('popular', 'fresh');
  }

  let key;
  try {
    key = getApiKey();
  } catch {
    return popularFallback('popular', 'emergency');
  }

  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${key}`;

  let tracked;
  try {
    tracked = await trackUpstreamCall(
      'geocode',
      () => fetchOpenWeather(url, { endpoint: 'geocode' }),
      { query },
    );
  } catch {
    return popularFallback('popular', 'emergency');
  }

  if (tracked.blocked) {
    if (cached?.emergency) {
      const results = rerankGeocodeResults(cached.emergency.payload.results ?? [], query, context);
      return wrapSnapshot({ ...cached.emergency, payload: { results } }, 'database', 'emergency');
    }

    return popularFallback('popular', 'emergency');
  }

  const apiResults = normalizeGeocodeResults(tracked.result.data ?? []);
  const rankedResults = mergeAndRankGeocodeResults(
    query,
    localResults,
    apiResults,
    GEOCODE_RESULT_LIMIT,
    context,
  );
  const finalizedResults = await finalizeGeocodeResults(rankedResults, query, context);
  const payload = { results: finalizedResults };

  return persistAndReturn({
    lat: normalized,
    lon: null,
    scope: 'geocode',
    cacheKey,
    payload,
    source: 'geocode',
  });
}
