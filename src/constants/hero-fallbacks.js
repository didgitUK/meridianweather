/**
 * Static hero fallbacks when Unsplash is unavailable.
 * Paths are served from /public/hero and work on any deploy host.
 */

function variant(path, label) {
  return {
    imageUrl: path,
    blurHash: null,
    photographer: label,
    photographerUrl: null,
    sourceUrl: null,
    sourceName: 'static',
    unsplashUrl: null,
    queryUsed: 'static-fallback',
  };
}

const DEFAULT_HERO = {
  landscape: variant('/hero/default-landscape.svg', 'meridian static hero'),
  portrait: variant('/hero/default-portrait.svg', 'meridian static hero'),
  photographer: 'meridian static hero',
  photographerUrl: null,
  sourceUrl: null,
  sourceName: 'static',
  unsplashUrl: null,
};

/** Country-code → dual landscape/portrait hero (ISO-style uppercase keys). */
export const HERO_STATIC_FALLBACKS = Object.freeze({
  DEFAULT: DEFAULT_HERO,
  GB: {
    landscape: variant('/hero/gb-landscape.svg', 'meridian static hero (GB)'),
    portrait: variant('/hero/gb-portrait.svg', 'meridian static hero (GB)'),
    photographer: 'meridian static hero (GB)',
    photographerUrl: null,
    sourceUrl: null,
    sourceName: 'static',
    unsplashUrl: null,
  },
  US: {
    landscape: variant('/hero/us-landscape.svg', 'meridian static hero (US)'),
    portrait: variant('/hero/us-portrait.svg', 'meridian static hero (US)'),
    photographer: 'meridian static hero (US)',
    photographerUrl: null,
    sourceUrl: null,
    sourceName: 'static',
    unsplashUrl: null,
  },
});

/**
 * Static SVG / stock fallbacks are withdrawn — map heroes fade in from black.
 * Kept for tests and email tooling that still reference the asset map.
 *
 * @param {{ country?: string | null }} _region
 * @returns {null}
 */
export function resolveStaticHeroFallback(_region) {
  return null;
}
