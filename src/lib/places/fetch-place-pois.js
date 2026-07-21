import {
  PLACE_POI_STALE_MS,
} from '@/constants/place-content';
import {
  canSpendOverpassCall,
  recordOverpassCall,
} from '@/lib/places/place-content-budget';
import { fetchOverpassPois } from '@/lib/places/overpass-pois';
import {
  getPlacePoisFetchedAt,
  listPlacePois,
  replacePlacePois,
} from '@/lib/places/place-pois-repo';

/**
 * Ensure POIs for a place are cached; refresh when stale or missing.
 * @param {{
 *   slug: string,
 *   lat: number,
 *   lon: number,
 *   force?: boolean,
 *   fetchImpl?: typeof fetch,
 * }} place
 */
export async function ensurePlacePois(place) {
  const fetchedAt = getPlacePoisFetchedAt(place.slug);
  const ageMs = fetchedAt ? Date.now() - Date.parse(fetchedAt) : Number.POSITIVE_INFINITY;
  const needsRefresh = place.force || !fetchedAt || ageMs > PLACE_POI_STALE_MS;

  if (!needsRefresh) {
    return {
      pois: listPlacePois(place.slug),
      refreshed: false,
      skipped: false,
    };
  }

  if (!canSpendOverpassCall()) {
    return {
      pois: listPlacePois(place.slug),
      refreshed: false,
      skipped: true,
      reason: 'overpass_budget',
    };
  }

  const pois = await fetchOverpassPois({
    lat: place.lat,
    lon: place.lon,
    fetchImpl: place.fetchImpl,
  });

  recordOverpassCall();
  const stored = replacePlacePois(place.slug, pois);

  return {
    pois: stored,
    refreshed: true,
    skipped: false,
  };
}
