/**
 * Deterministic “did you know” geo facts for place SEO intros.
 * Pick is stable per city so crawlers and users see a consistent fact.
 */

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function roundCoord(value, digits = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return null;
  }
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
}

/**
 * @param {{
 *   name?: string | null,
 *   country?: string | null,
 *   state?: string | null,
 *   lat?: number | null,
 *   lon?: number | null,
 * }} city
 * @returns {{
 *   key: 'lat' | 'equator' | 'prime' | 'region',
 *   params: Record<string, string | number>,
 * } | null}
 */
export function resolvePlaceDidYouKnow(city) {
  const name = city?.name?.trim();
  if (!name) {
    return null;
  }

  const lat = Number(city?.lat);
  const lon = Number(city?.lon);
  const region = [city?.state, city?.country].filter(Boolean).join(', ') || city?.country || '';
  const seed = hashString(`${name}|${city?.country ?? ''}|${roundCoord(lat, 2) ?? ''}`);
  const variants = [];

  if (Number.isFinite(lat)) {
    const absLat = Math.abs(lat);
    const hemisphere = lat >= 0 ? 'N' : 'S';
    variants.push({
      key: 'lat',
      params: {
        city: name,
        lat: roundCoord(absLat, 1),
        hemisphere,
        region,
      },
    });
    variants.push({
      key: 'equator',
      params: {
        city: name,
        km: Math.round(absLat * 111),
        region,
      },
    });
  }

  if (Number.isFinite(lon)) {
    const absLon = Math.abs(lon);
    const side = lon >= 0 ? 'east' : 'west';
    variants.push({
      key: 'prime',
      params: {
        city: name,
        lon: roundCoord(absLon, 1),
        side,
        region,
      },
    });
  }

  if (region) {
    variants.push({
      key: 'region',
      params: {
        city: name,
        region,
      },
    });
  }

  if (variants.length === 0) {
    return null;
  }

  return variants[seed % variants.length];
}
