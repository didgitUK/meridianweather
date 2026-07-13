import { scoreGeocodeResult } from '@/lib/geocode-ranking';

export function normalizeAdminAreaName(name) {
  if (!name) {
    return null;
  }

  return name
    .replace(/^Borough of /i, '')
    .replace(/^County of /i, '')
    .replace(/^City and County of /i, '')
    .replace(/^City of /i, '')
    .trim();
}

export function pickCountyLabel(cityName, reverseName) {
  if (!reverseName?.trim()) {
    return null;
  }

  const trimmed = reverseName.trim();
  const normalized = normalizeAdminAreaName(trimmed);

  if (!normalized) {
    return null;
  }

  if (normalized.toLowerCase() === cityName.toLowerCase()) {
    if (trimmed.toLowerCase() !== cityName.toLowerCase()) {
      return trimmed;
    }

    return null;
  }

  return normalized;
}

export function buildGeocodeResultLabel({ name, county, state, country }) {
  return [name, county, state, country].filter(Boolean).join(', ');
}

export function hasAmbiguousGeocodeResults(results) {
  const counts = new Map();

  for (const result of results) {
    const key = [result.name, result.state ?? '', result.country ?? ''].join('|').toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.values()].some((count) => count > 1);
}

export function buildCountyDedupeKey(result) {
  return [result.name, result.county ?? '', result.country ?? ''].join('|').toLowerCase();
}

export async function enrichAndDedupeGeocodeResults(
  results,
  query,
  context,
  { reverseLookup },
) {
  if (!hasAmbiguousGeocodeResults(results)) {
    return results;
  }

  const enriched = await Promise.all(
    results.map(async (result) => {
      if (result.county) {
        return result;
      }

      const reverse = await reverseLookup(result.lat, result.lon);
      const county = pickCountyLabel(result.name, reverse?.name ?? null);

      return {
        ...result,
        county,
        label: buildGeocodeResultLabel({ ...result, county }),
      };
    }),
  );

  const merged = new Map();

  for (const result of enriched) {
    const key = buildCountyDedupeKey(result);
    const existing = merged.get(key);

    if (
      !existing
      || scoreGeocodeResult(result, query, context) > scoreGeocodeResult(existing, query, context)
    ) {
      merged.set(key, result);
    }
  }

  return [...merged.values()].sort(
    (left, right) => scoreGeocodeResult(right, query, context) - scoreGeocodeResult(left, query, context),
  );
}
