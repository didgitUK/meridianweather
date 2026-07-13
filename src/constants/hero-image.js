/** Hero background image cache TTL (30 days). */
export const HERO_IMAGE_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Marks cache rows written with dual landscape/portrait resolution. */
export const HERO_IMAGE_CACHE_DUAL_VERSION = 1;

/** Unsplash search page size so aspect gates have enough candidates. */
export const HERO_IMAGE_SEARCH_PER_PAGE = 12;

/** ~16:9 landscape band (width / height). */
export const HERO_LANDSCAPE_ASPECT_MIN = 1.55;
export const HERO_LANDSCAPE_ASPECT_MAX = 1.9;
export const HERO_LANDSCAPE_MIN_WIDTH = 1600;

/** ~9:16 portrait band (width / height). */
export const HERO_PORTRAIT_ASPECT_MIN = 0.52;
export const HERO_PORTRAIT_ASPECT_MAX = 0.65;
export const HERO_PORTRAIT_MIN_HEIGHT = 1600;

/** Imgix delivery params applied to Unsplash `urls.raw`. */
export const HERO_LANDSCAPE_DELIVERY = Object.freeze({
  w: 2400,
  h: 1350,
  fit: 'crop',
  crop: 'entropy',
  q: 80,
  fm: 'webp',
});

export const HERO_PORTRAIT_DELIVERY = Object.freeze({
  w: 1080,
  h: 1920,
  fit: 'crop',
  crop: 'entropy',
  q: 80,
  fm: 'webp',
});
