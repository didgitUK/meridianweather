import { NORTH_ENGLAND_SEED_LOCATIONS } from '@/constants/seed-locations';
import { PLATFORM_SHOWCASE_CITIES } from '@/constants/platform';
import { haversineKm } from '@/lib/geo/distance';

const NEARBY_POOL = [...NORTH_ENGLAND_SEED_LOCATIONS, ...PLATFORM_SHOWCASE_CITIES];

/**
 * Rank seed / showcase places by distance from a home coordinate.
 *
 * @param {number} lat
 * @param {number} lon
 * @param {{
 *   excludeName?: string | null,
 *   limit?: number,
 *   minDistanceKm?: number,
 *   maxDistanceKm?: number,
 * }} [options]
 */
export function pickNearbyMapPlaces(lat, lon, options = {}) {
  const {
    excludeName = null,
    limit = 5,
    minDistanceKm = 6,
    maxDistanceKm = 95,
  } = typeof options === 'string' || options == null
    ? { excludeName: options }
    : options;

  const exclude = excludeName?.trim().toLowerCase() ?? '';
  const ranked = NEARBY_POOL
    .filter((place) => {
      if (!Number.isFinite(place.lat) || !Number.isFinite(place.lon)) {
        return false;
      }
      if (exclude && place.name?.toLowerCase() === exclude) {
        return false;
      }
      return true;
    })
    .map((place) => ({
      ...place,
      distanceKm: haversineKm(lat, lon, place.lat, place.lon),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const nearby = ranked.filter(
    (place) => place.distanceKm >= minDistanceKm && place.distanceKm <= maxDistanceKm,
  );
  const pool = nearby.length >= Math.min(3, limit)
    ? nearby
    : ranked.filter((place) => place.distanceKm >= minDistanceKm);
  const unique = [];
  const seen = new Set();

  for (const place of pool) {
    const key = `${place.name}|${place.country}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(place);
    if (unique.length >= limit) {
      break;
    }
  }

  return unique.slice(0, limit);
}
