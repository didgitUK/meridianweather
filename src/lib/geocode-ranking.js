import { POPULAR_CITIES } from '@/constants/popular-cities';
import { haversineKm } from '@/lib/geo/distance';

const GEOCODE_RESULT_LIMIT = 10;

function buildLabel(result) {
  return [result.name, result.county, result.state, result.country].filter(Boolean).join(', ');
}

function locationKey(lat, lon) {
  return `${Number(lat).toFixed(2)},${Number(lon).toFixed(2)}`;
}

function normalizeCity(city, source) {
  return {
    name: city.name,
    country: city.country,
    state: city.state ?? null,
    county: city.county ?? null,
    lat: city.lat,
    lon: city.lon,
    population: city.population ?? null,
    label: buildLabel(city),
    source,
  };
}

function getNameMatchScore(name, query) {
  const normalizedName = name.toLowerCase();
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    return 0;
  }

  if (normalizedName === normalizedQuery) {
    return 1_000;
  }

  if (normalizedName.startsWith(normalizedQuery)) {
    return 700;
  }

  const words = normalizedName.split(/[\s,-]+/);

  if (words.some((word) => word.startsWith(normalizedQuery))) {
    return 500;
  }

  if (normalizedName.includes(normalizedQuery)) {
    return 200;
  }

  return 0;
}

function getPopulationScore(population) {
  if (!population || population <= 0) {
    return 0;
  }

  return Math.log10(population) * 80;
}

export function scoreGeocodeResult(result, query, context = null) {
  const nameScore = getNameMatchScore(result.name, query);

  if (nameScore === 0) {
    return 0;
  }

  const populationScore = getPopulationScore(result.population);
  const curatedBoost = result.source === 'popular' ? 120 : 0;
  let score = nameScore + populationScore + curatedBoost;

  if (!context?.country) {
    // Still apply distance when coordinates are known without a country context.
  } else if (result.country?.toUpperCase() === context.country.toUpperCase()) {
    score += 450;
  }

  if (
    context?.lat != null
    && context?.lon != null
    && result.lat != null
    && result.lon != null
  ) {
    const distanceKm = haversineKm(context.lat, context.lon, result.lat, result.lon);
    // Exact name matches stay name-dominant; prefix/partial prefer nearer places.
    const distanceWeight = nameScore >= 1_000 ? 0.75 : 1.45;
    score += Math.max(0, 400 - distanceKm * distanceWeight);
  }

  return score;
}

export function rerankGeocodeResults(results, query, context = null, limit = GEOCODE_RESULT_LIMIT) {
  return [...results]
    .map((result) => ({
      result,
      score: scoreGeocodeResult(result, query, context),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((entry) => entry.result);
}

export function searchPopularCities(query, limit = GEOCODE_RESULT_LIMIT) {
  const trimmed = query.trim();

  if (trimmed.length < 2) {
    return [];
  }

  return POPULAR_CITIES
    .map((city) => ({
      city,
      score: scoreGeocodeResult(normalizeCity(city, 'popular'), trimmed, null),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((entry) => normalizeCity(entry.city, 'popular'));
}

export function enrichGeocodeWithPopulation(results) {
  const populationByKey = new Map(
    POPULAR_CITIES.map((city) => [locationKey(city.lat, city.lon), city.population]),
  );

  return results.map((result) => ({
    ...result,
    population: result.population ?? populationByKey.get(locationKey(result.lat, result.lon)) ?? null,
  }));
}

export function mergeAndRankGeocodeResults(
  query,
  localResults,
  apiResults,
  limit = GEOCODE_RESULT_LIMIT,
  context = null,
) {
  const merged = new Map();

  for (const result of [...localResults, ...enrichGeocodeWithPopulation(apiResults)]) {
    const key = locationKey(result.lat, result.lon);
    const existing = merged.get(key);

    if (
      !existing
      || scoreGeocodeResult(result, query, context) > scoreGeocodeResult(existing, query, context)
    ) {
      merged.set(key, result);
    }
  }

  return [...merged.values()]
    .map((result) => ({
      result,
      score: scoreGeocodeResult(result, query, context),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((entry) => {
      const { source: _source, population: _population, ...publicResult } = entry.result;
      return {
        ...publicResult,
        label: buildLabel(publicResult),
      };
    });
}

export { GEOCODE_RESULT_LIMIT };
