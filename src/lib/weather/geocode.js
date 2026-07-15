import {
  enrichAndDedupeGeocodeResults,
} from '@/lib/geocode-enrichment';
import { searchNominatimPlaces } from '@/lib/geocode-nominatim';
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
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
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

function mergeRankedPayload(query, localResults, apiResults, context) {
  return mergeAndRankGeocodeResults(
    query,
    localResults,
    apiResults,
    GEOCODE_RESULT_LIMIT,
    context,
  );
}

async function mergeWithPrefixPlaces(query, baseResults, context) {
  const prefixResults = await searchNominatimPlaces(query, context);
  const localResults = searchPopularCities(query, GEOCODE_RESULT_LIMIT);
  return mergeRankedPayload(query, localResults, [...baseResults, ...prefixResults], context);
}

export async function fetchGeocode(query, context = null) {
  const normalized = query.trim().toLowerCase();
  const cacheKey = buildSnapshotKey(normalized, null, 'geocode');
  const cached = readFromCaches(cacheKey);

  // Always re-run location-biased prefix search even on L1/L2 hits so
  // near-you completions (Hart → Hartlepool) are not frozen in a global cache.
  if (cached && !cached.emergency) {
    const merged = await mergeWithPrefixPlaces(query, cached.data.results ?? [], context);
    const finalizedResults = await finalizeGeocodeResults(merged, query, context);

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

  async function popularWithPrefix(cacheLayer = 'popular', freshness = 'fresh') {
    const offlineResults = await mergeWithPrefixPlaces(query, [], context);
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

    return popularWithPrefix('popular', 'fresh');
  }

  let key;
  try {
    key = getApiKey();
  } catch {
    return popularWithPrefix('popular', 'emergency');
  }

  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${key}`;

  let tracked;
  let prefixResults = [];

  try {
    const [owmTracked, prefix] = await Promise.all([
      trackUpstreamCall(
        'geocode',
        () => fetchOpenWeather(url, { endpoint: 'geocode' }),
        { query, trigger: WEATHER_CHECK_TRIGGERS.geocodeSearch, reason: 'city_search' },
      ),
      searchNominatimPlaces(query, context),
    ]);
    tracked = owmTracked;
    prefixResults = prefix;
  } catch {
    return popularWithPrefix('popular', 'emergency');
  }

  if (tracked.blocked) {
    if (cached?.emergency) {
      const results = rerankGeocodeResults(cached.emergency.payload.results ?? [], query, context);
      return wrapSnapshot({ ...cached.emergency, payload: { results } }, 'database', 'emergency');
    }

    const ranked = mergeRankedPayload(query, localResults, prefixResults, context);
    return {
      data: { results: ranked },
      meta: { cacheLayer: 'popular', freshness: 'emergency' },
    };
  }

  const apiResults = [
    ...normalizeGeocodeResults(tracked.result.data ?? []),
    ...prefixResults,
  ];
  const rankedResults = mergeRankedPayload(query, localResults, apiResults, context);
  const finalizedResults = await finalizeGeocodeResults(rankedResults, query, context);

  // Persist OWM + popular only (stable worldwide); location-biased prefixes stay request-time.
  const owmOnly = mergeRankedPayload(
    query,
    localResults,
    normalizeGeocodeResults(tracked.result.data ?? []),
    null,
  );

  void persistAndReturn({
    lat: normalized,
    lon: null,
    scope: 'geocode',
    cacheKey,
    payload: { results: owmOnly },
    source: 'geocode',
  });

  return {
    data: { results: finalizedResults },
    meta: { cacheLayer: 'network', freshness: 'fresh' },
  };
}
