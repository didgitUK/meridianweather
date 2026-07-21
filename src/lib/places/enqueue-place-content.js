import { classifyPlaceSeoTier } from '@/lib/places/places-seo-budget';
import { getLatestPlaceArticle } from '@/lib/places/place-articles-repo';
import { getPlacePoisFetchedAt } from '@/lib/places/place-pois-repo';
import { runPlaceContentPipeline } from '@/lib/places/place-content-pipeline';
import {
  PLACE_ARTICLE_STATUS,
  PLACE_GUIDE_STALE_MS,
  PLACE_POI_STALE_MS,
} from '@/constants/place-content';

/**
 * Fire-and-forget place content enrichment for hot places.
 * Never blocks the weather page render path on LLM/Overpass work.
 * @param {{
 *   slug: string,
 *   name: string,
 *   lat: number,
 *   lon: number,
 *   adminArea?: string | null,
 *   state?: string | null,
 *   country?: string | null,
 *   population?: number,
 *   placeType?: string,
 *   tier?: number,
 *   viewCount?: number,
 *   lastViewedAt?: string | null,
 * }} place
 * @param {unknown} [weather]
 */
export function enqueuePlaceContentIfNeeded(place, weather) {
  if (!place?.slug || !Number.isFinite(place.lat) || !Number.isFinite(place.lon)) {
    return;
  }

  const tier = classifyPlaceSeoTier(place);
  if (tier === 'cold') {
    return;
  }

  const poisFetchedAt = getPlacePoisFetchedAt(place.slug);
  const poisStale =
    !poisFetchedAt
    || Date.now() - Date.parse(poisFetchedAt) > PLACE_POI_STALE_MS;

  const latest = getLatestPlaceArticle(place.slug);
  const guideStale =
    !latest
    || latest.status !== PLACE_ARTICLE_STATUS.published
    || !latest.generatedAt
    || Date.now() - Date.parse(latest.generatedAt) > PLACE_GUIDE_STALE_MS;

  if (!poisStale && !guideStale) {
    return;
  }

  setTimeout(() => {
    runPlaceContentPipeline({
      place: {
        slug: place.slug,
        name: place.name,
        lat: place.lat,
        lon: place.lon,
        adminArea: place.adminArea ?? place.state,
        country: place.country,
        population: place.population,
        placeType: place.placeType,
      },
      weather,
    }).catch(() => {
      // Background enrichment must not surface to the page.
    });
  }, 0);
}
