import {
  PLACE_CONTENT_OVERPASS_URL,
  PLACE_POI_MAX_PER_CATEGORY,
  PLACE_POI_MAX_TOTAL,
  PLACE_POI_OSM_RULES,
  PLACE_POI_SEARCH_RADIUS_M,
} from '@/constants/place-content';
import { haversineKm } from '@/lib/geo/distance';

/**
 * @param {Record<string, string>} tags
 */
export function classifyOsmTags(tags) {
  if (!tags || typeof tags !== 'object') {
    return null;
  }

  for (const rule of PLACE_POI_OSM_RULES) {
    if (rule.match(tags)) {
      return rule.category;
    }
  }

  return null;
}

/**
 * @param {{
 *   type?: string,
 *   id?: number,
 *   lat?: number,
 *   lon?: number,
 *   center?: { lat?: number, lon?: number },
 *   tags?: Record<string, string>,
 * }} element
 * @param {{ lat: number, lon: number }} origin
 */
export function mapOverpassElement(element, origin) {
  const tags = element?.tags ?? {};
  const name = String(tags.name ?? '').trim();
  if (!name) {
    return null;
  }

  const category = classifyOsmTags(tags);
  if (!category) {
    return null;
  }

  const lat = Number(element.lat ?? element.center?.lat);
  const lon = Number(element.lon ?? element.center?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  const distanceKm = haversineKm(origin.lat, origin.lon, lat, lon);

  return {
    category,
    name,
    lat,
    lon,
    osmId: element.id != null ? `${element.type ?? 'node'}/${element.id}` : null,
    tags,
    distanceKm,
  };
}

/**
 * Cap results per category then overall, nearest first.
 * @param {ReturnType<typeof mapOverpassElement>[]} pois
 */
export function capPlacePois(pois) {
  const byCategory = new Map();

  const sorted = [...pois].sort(
    (a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0),
  );

  for (const poi of sorted) {
    const list = byCategory.get(poi.category) ?? [];
    if (list.length >= PLACE_POI_MAX_PER_CATEGORY) {
      continue;
    }
    list.push(poi);
    byCategory.set(poi.category, list);
  }

  const merged = [...byCategory.values()].flat();
  merged.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  return merged.slice(0, PLACE_POI_MAX_TOTAL);
}

/**
 * @param {{ lat: number, lon: number, radiusM?: number }} options
 */
export function buildOverpassQuery(options) {
  const lat = options.lat;
  const lon = options.lon;
  const radius = options.radiusM ?? PLACE_POI_SEARCH_RADIUS_M;

  return `
[out:json][timeout:25];
(
  node(around:${radius},${lat},${lon})[name][amenity~"^(restaurant|cafe|fast_food|ice_cream|cinema|community_centre|pub|bar|nightclub|biergarten)$"];
  node(around:${radius},${lat},${lon})[name][tourism];
  node(around:${radius},${lat},${lon})[name][leisure~"^(playground|park|nature_reserve|garden|golf_course)$"];
  node(around:${radius},${lat},${lon})[name][natural~"^(beach|cliff)$"];
  way(around:${radius},${lat},${lon})[name][amenity~"^(restaurant|cafe|fast_food|ice_cream|cinema|community_centre|pub|bar|nightclub|biergarten)$"];
  way(around:${radius},${lat},${lon})[name][tourism];
  way(around:${radius},${lat},${lon})[name][leisure~"^(playground|park|nature_reserve|garden|golf_course)$"];
  way(around:${radius},${lat},${lon})[name][natural~"^(beach|cliff)$"];
);
out center tags;
`.trim();
}

/**
 * @param {{ lat: number, lon: number, radiusM?: number, fetchImpl?: typeof fetch }} options
 */
export async function fetchOverpassPois(options) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const query = buildOverpassQuery(options);
  const maxAttempts = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetchImpl(PLACE_CONTENT_OVERPASS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          Accept: 'application/json',
          'User-Agent': 'MeridianWeather/1.0 (place-content; https://meridianweather.co.uk)',
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(45_000),
      });

      if (response.status === 429 || response.status === 504 || response.status === 502) {
        lastError = new Error(`Overpass HTTP ${response.status}`);
        await sleep(1500 * attempt);
        continue;
      }

      if (!response.ok) {
        throw new Error(`Overpass HTTP ${response.status}`);
      }

      const payload = await response.json();
      const elements = Array.isArray(payload?.elements) ? payload.elements : [];
      const origin = { lat: options.lat, lon: options.lon };
      const mapped = elements
        .map((element) => mapOverpassElement(element, origin))
        .filter(Boolean);

      return capPlacePois(mapped);
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(1500 * attempt);
        continue;
      }
    }
  }

  throw lastError ?? new Error('Overpass failed');
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
