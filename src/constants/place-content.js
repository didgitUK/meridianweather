/**
 * Place guides + Things to do — budgets, categories, validation targets.
 */

export const PLACE_POI_CATEGORIES = Object.freeze({
  family: 'family',
  restaurants: 'restaurants',
  attractions: 'attractions',
  outdoors: 'outdoors',
  nightlife: 'nightlife',
});

export const PLACE_POI_CATEGORY_ORDER = Object.freeze([
  PLACE_POI_CATEGORIES.family,
  PLACE_POI_CATEGORIES.restaurants,
  PLACE_POI_CATEGORIES.attractions,
  PLACE_POI_CATEGORIES.outdoors,
  PLACE_POI_CATEGORIES.nightlife,
]);

/** OSM tag → Meridian category mapping used by Overpass parser. */
export const PLACE_POI_OSM_RULES = Object.freeze([
  {
    category: PLACE_POI_CATEGORIES.family,
    match: (tags) =>
      tags.leisure === 'playground'
      || tags.amenity === 'cinema'
      || tags.tourism === 'zoo'
      || tags.tourism === 'theme_park'
      || tags.amenity === 'community_centre',
  },
  {
    category: PLACE_POI_CATEGORIES.restaurants,
    match: (tags) =>
      tags.amenity === 'restaurant'
      || tags.amenity === 'cafe'
      || tags.amenity === 'fast_food'
      || tags.amenity === 'ice_cream',
  },
  {
    category: PLACE_POI_CATEGORIES.attractions,
    match: (tags) =>
      Boolean(tags.tourism)
      && tags.tourism !== 'hotel'
      && tags.tourism !== 'apartment'
      && tags.tourism !== 'guest_house'
      && tags.tourism !== 'hostel'
      && tags.tourism !== 'motel',
  },
  {
    category: PLACE_POI_CATEGORIES.outdoors,
    match: (tags) =>
      tags.leisure === 'park'
      || tags.leisure === 'nature_reserve'
      || tags.leisure === 'garden'
      || tags.natural === 'beach'
      || tags.natural === 'cliff'
      || tags.tourism === 'viewpoint',
  },
  {
    category: PLACE_POI_CATEGORIES.nightlife,
    match: (tags) =>
      tags.amenity === 'pub'
      || tags.amenity === 'bar'
      || tags.amenity === 'nightclub'
      || tags.amenity === 'biergarten',
  },
]);

export const PLACE_POI_SEARCH_RADIUS_M = 4_000;
export const PLACE_POI_MAX_PER_CATEGORY = 12;
export const PLACE_POI_MAX_TOTAL = 48;
/** Re-fetch Overpass when cache older than this (quarterly). */
export const PLACE_POI_STALE_MS = 90 * 24 * 60 * 60 * 1000;
export const PLACE_POI_DAILY_OVERPASS_CAP = 40;

export const PLACE_ARTICLE_STATUS = Object.freeze({
  draft: 'draft',
  published: 'published',
  failed: 'failed',
});

/** Phase 1 guide type. */
export const PLACE_GUIDE_CATEGORY = 'Weather planner';

export const PLACE_GUIDE_MIN_WORDS = 1500;
export const PLACE_GUIDE_MIN_SOURCES = 3;
export const PLACE_GUIDE_REQUIRED_H2 = Object.freeze([
  'Weather outlook',
  'Things to do',
  'Getting around',
  'Practical tips',
]);

export const PLACE_GUIDE_PROMPT_VERSION = 'place-guide-v1';
export const PLACE_GUIDE_STALE_MS = 30 * 24 * 60 * 60 * 1000;
export const PLACE_GUIDE_DAILY_LLM_CAP = 20;
export const PLACE_GUIDE_CRON_PLACE_LIMIT = 10;

export const PLACE_LOCAL_LINKS_MAX = 5;
export const PLACE_LOCAL_LINKS_STALE_MS = 7 * 24 * 60 * 60 * 1000;

export const PLACE_CONTENT_OVERPASS_URL =
  process.env.PLACE_CONTENT_OVERPASS_URL
  || 'https://overpass-api.de/api/interpreter';
