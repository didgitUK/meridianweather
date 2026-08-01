import { ROBOTS_INDEX, ROBOTS_NOINDEX } from '@/lib/seo';

/** Locales with real editorial depth for AdSense / Search review. */
export const SEARCH_INDEX_LOCALES = Object.freeze(['en', 'en-GB']);

/** Operator-facing docs — keep public but out of the search/AdSense crawl corpus. */
export const DOCS_NOINDEX_SLUGS = Object.freeze([
  'deployment',
  'api-limits',
  'api-reference',
  'monetization',
]);

/**
 * @param {string | null | undefined} locale
 */
export function isSearchIndexLocale(locale) {
  return SEARCH_INDEX_LOCALES.includes(String(locale ?? ''));
}

/**
 * @param {string | null | undefined} slug
 */
export function isDocsNoindexSlug(slug) {
  return DOCS_NOINDEX_SLUGS.includes(String(slug ?? ''));
}

/**
 * @param {{
 *   locale?: string | null,
 *   noindex?: boolean,
 * }} [options]
 */
export function resolveRobots(options = {}) {
  if (options.noindex || !isSearchIndexLocale(options.locale)) {
    return ROBOTS_NOINDEX;
  }
  return ROBOTS_INDEX;
}

/**
 * Cold / geocode-created places (tier ≥ 3) stay usable but not indexed
 * until curated into hot/warm inventory with unique editorial.
 * @param {{ tier?: number | null } | null | undefined} place
 */
export function shouldNoindexWeatherPlace(place) {
  const tier = Number(place?.tier);
  if (!Number.isFinite(tier)) {
    return true;
  }
  return tier >= 3;
}
