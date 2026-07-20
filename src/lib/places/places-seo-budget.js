import {
  PLACE_REFRESH_TIER,
  PLACE_SEO_DAILY_CALL_BUDGET,
  PLACE_SEO_HOT_REFRESH_LIMIT,
  PLACE_SEO_SCOPES_PER_FETCH,
  PLACE_SEO_SOFT_STALE_REMAINING,
  PLACE_SEO_WARM_VIEW_WINDOW_MS,
  WEATHER_PLACE_SEO_MAX_AGE_MS,
  WEATHER_PLACE_SEO_STALE_MS,
} from '@/constants/weather-places';
import { getUsageSnapshot } from '@/lib/api-usage-tracker';

/**
 * @typedef {'hot' | 'warm' | 'cold'} PlaceSeoTierName
 */

/**
 * Classify a place for SEO refresh policy.
 * @param {{ tier?: number, viewCount?: number, lastViewedAt?: string | null, population?: number }} place
 * @param {{ now?: number }} [options]
 * @returns {PlaceSeoTierName}
 */
export function classifyPlaceSeoTier(place, options = {}) {
  const now = options.now ?? Date.now();
  const viewCount = place?.viewCount ?? 0;
  const lastViewedAt = place?.lastViewedAt ? Date.parse(place.lastViewedAt) : NaN;
  const viewedRecently =
    Number.isFinite(lastViewedAt) && now - lastViewedAt <= PLACE_SEO_WARM_VIEW_WINDOW_MS;

  if (
    place?.tier === PLACE_REFRESH_TIER.hot
    || viewCount >= 25
    || (place?.population ?? 0) >= 100_000
  ) {
    return 'hot';
  }

  if (place?.tier === PLACE_REFRESH_TIER.warm || viewedRecently || viewCount > 0) {
    return 'warm';
  }

  return 'cold';
}

/**
 * Max age to accept a cached SEO snapshot before attempting upstream.
 * Tightens for hot places; loosens when daily quota is low.
 * @param {PlaceSeoTierName} tierName
 * @param {{ remaining?: number }} [usage]
 */
export function resolvePlaceSeoMaxAgeMs(tierName, usage = {}) {
  const remaining = usage.remaining ?? PLACE_SEO_DAILY_CALL_BUDGET;

  if (remaining < PLACE_SEO_SOFT_STALE_REMAINING) {
    return WEATHER_PLACE_SEO_STALE_MS;
  }

  if (tierName === 'cold') {
    return WEATHER_PLACE_SEO_STALE_MS;
  }

  return WEATHER_PLACE_SEO_MAX_AGE_MS;
}

/**
 * Whether SEO may spend upstream calls for a refresh right now.
 */
export function canSpendPlaceSeoBudget(usage = getUsageSnapshot()) {
  const remaining = usage?.remaining ?? 0;
  if (remaining < PLACE_SEO_SCOPES_PER_FETCH) {
    return false;
  }

  const used = (usage?.dailyLimit ?? 1000) - remaining;
  return used < PLACE_SEO_DAILY_CALL_BUDGET;
}

/**
 * How many hot places the nightly cron may refresh given remaining quota.
 */
export function resolveHotRefreshPlaceLimit(usage = getUsageSnapshot()) {
  if (!canSpendPlaceSeoBudget(usage)) {
    return 0;
  }

  const remaining = usage.remaining ?? 0;
  const used = (usage.dailyLimit ?? 1000) - remaining;
  const seoRemaining = Math.max(0, PLACE_SEO_DAILY_CALL_BUDGET - used);
  const byBudget = Math.floor(Math.min(remaining, seoRemaining) / PLACE_SEO_SCOPES_PER_FETCH);
  return Math.min(PLACE_SEO_HOT_REFRESH_LIMIT, byBudget);
}
