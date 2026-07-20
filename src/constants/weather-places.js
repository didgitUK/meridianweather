/**
 * SEO weather place pages — cache, tiers, and OWM budget constants.
 */
export const WEATHER_PLACE_SEO_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const WEATHER_PLACE_SEO_STALE_MS = 48 * 60 * 60 * 1000;
export const WEATHER_PLACE_SEO_REVALIDATE_SECONDS = 86400;

export const UK_PLACES_PHASE_A_LIMIT = 500;
export const UK_PLACES_PHASE_B_LIMIT = 500;

/** Place refresh tiers (lower = hotter). */
export const PLACE_REFRESH_TIER = Object.freeze({
  hot: 1,
  warm: 2,
  cold: 3,
});

/** Nightly hot-tier refresh target (places × ~3 scopes ≈ call budget). */
export const PLACE_SEO_HOT_REFRESH_LIMIT = 200;

/** Reserve upstream calls for dashboard/product after SEO spend. */
export const PLACE_SEO_DAILY_CALL_BUDGET = 600;

/** When remaining daily calls fall below this, SEO accepts soft-stale longer. */
export const PLACE_SEO_SOFT_STALE_REMAINING = 200;

/** Warm tier: viewed within this window. */
export const PLACE_SEO_WARM_VIEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/** Scopes fetched per SEO place page (current + daily + hourly). */
export const PLACE_SEO_SCOPES_PER_FETCH = 3;
