import { BRAND } from '@/constants/brand';

const PHOTON_TIMEOUT_MS = 2500;
const PHOTON_LIMIT = 12;

const ALLOWED_TYPES = new Set(['city', 'town', 'village', 'hamlet', 'locality', 'district']);
const ALLOWED_OSM_VALUES = new Set([
  'city',
  'town',
  'village',
  'hamlet',
  'municipality',
  'suburb',
  'neighbourhood',
  'borough',
]);

const PHOTON_USER_AGENT = `${BRAND.name}/1.0 (https://${BRAND.domain}; weather-dashboard)`;

/**
 * @param {object} props
 * @returns {string | null}
 */
export function pickPhotonPlaceName(props) {
  const name = props?.name;
  if (typeof name === 'string' && name.trim()) {
    return name.trim();
  }
  return null;
}

/**
 * @param {string} name
 * @param {string} query
 * @returns {boolean}
 */
function nameMatchesQuery(name, query) {
  const normalizedName = name.toLowerCase();
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) {
    return false;
  }
  if (normalizedName.startsWith(normalizedQuery)) {
    return true;
  }
  return normalizedName.split(/[\s,-]+/).some((word) => word.startsWith(normalizedQuery));
}

/**
 * @param {object} feature
 * @param {string} query
 * @returns {boolean}
 */
export function isPhotonPlaceFeature(feature, query) {
  const props = feature?.properties;
  const coords = feature?.geometry?.coordinates;
  if (!props || !Array.isArray(coords) || coords.length < 2) {
    return false;
  }

  const name = pickPhotonPlaceName(props);
  if (!name || !nameMatchesQuery(name, query)) {
    return false;
  }

  const type = String(props.type ?? '').toLowerCase();
  const osmValue = String(props.osm_value ?? '').toLowerCase();
  const osmKey = String(props.osm_key ?? '').toLowerCase();

  if (['industrial', 'power', 'station', 'halt', 'subway_entrance'].includes(osmValue)) {
    return false;
  }

  if (osmKey === 'railway' || osmKey === 'building' || osmKey === 'amenity') {
    return false;
  }

  if (ALLOWED_TYPES.has(type) && (osmKey === 'place' || ALLOWED_OSM_VALUES.has(osmValue) || type === 'city')) {
    return true;
  }

  if (osmKey === 'place' && ALLOWED_OSM_VALUES.has(osmValue)) {
    return true;
  }

  // Named administrative settlement (often UK towns).
  if (osmValue === 'administrative' && type === 'city') {
    return true;
  }

  return false;
}

/**
 * Map a Photon GeoJSON feature into meridian geocode shape.
 * @param {object} feature
 * @param {string} query
 * @returns {object | null}
 */
export function normalizePhotonFeature(feature, query) {
  if (!isPhotonPlaceFeature(feature, query)) {
    return null;
  }

  const props = feature.properties;
  const [lon, lat] = feature.geometry.coordinates;
  const name = pickPhotonPlaceName(props);
  const country = props.countrycode?.toUpperCase?.() ?? null;

  if (!name || !country || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  const state = props.state ?? props.county ?? null;
  const county = props.county && props.county !== state ? props.county : null;

  return {
    name,
    country,
    state,
    county,
    lat,
    lon,
    label: [name, county, state, country].filter(Boolean).join(', '),
    source: 'photon',
  };
}

/**
 * Prefix-friendly place search via Photon (OSM-based autocomplete).
 * Passes lat/lon bias when available so local prefixes (Hart → Hartlepool) surface.
 * Fail-open: returns [] on timeout / network / parse errors.
 *
 * @param {string} query
 * @param {{ lat?: number | null, lon?: number | null } | null} [context]
 * @returns {Promise<object[]>}
 */
export async function searchNominatimPlaces(query, context = null) {
  const trimmed = query?.trim?.() ?? '';
  if (trimmed.length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    q: trimmed,
    limit: String(PHOTON_LIMIT),
  });

  if (context?.lat != null && context?.lon != null) {
    params.set('lat', String(context.lat));
    params.set('lon', String(context.lon));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PHOTON_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://photon.komoot.io/api/?${params}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': PHOTON_USER_AGENT,
        },
        signal: controller.signal,
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    const features = Array.isArray(payload?.features) ? payload.features : [];
    const seen = new Set();
    const results = [];

    for (const feature of features) {
      const normalized = normalizePhotonFeature(feature, trimmed);
      if (!normalized) {
        continue;
      }

      const key = `${normalized.name.toLowerCase()}|${normalized.country}|${normalized.lat.toFixed(2)}|${normalized.lon.toFixed(2)}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      results.push(normalized);
    }

    return results;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
