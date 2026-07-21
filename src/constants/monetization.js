export const TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
};

export const PRE_CHOICE_CONSENT = {
  essential: true,
  functional: false,
  marketing: false,
  analytics: false,
  advertising: false,
};

export const DEFAULT_CONSENT = {
  essential: true,
  functional: true,
  marketing: false,
  analytics: false,
  advertising: false,
};

export const PREMIUM_FEATURES = {
  minutely: 'Next-hour precipitation',
  extendedDaily: 'Full 10-day outlook',
};

/** Default overlay copy for unfinished AdSense placements. */
export const AD_PLACEHOLDER_OVERLAY =
  'Adsense Location: Adverts will go here on live website.';

/**
 * Branded static creatives when live AdSense is off, blocked, or unfilled.
 * Square for hero; banner for dashboard / city-detail / recent-checks.
 */
export const AD_PLACEHOLDER_IMAGES = Object.freeze({
  dashboard: '/ads/BannerAds-Placeholder.png',
  hero: '/ads/SquareAds-Placeholder.png',
  'city-detail': '/ads/BannerAds-Placeholder.png',
  'recent-checks': '/ads/BannerAds-Placeholder.png',
  'weather-place-mid': '/ads/BannerAds-Placeholder.png',
  default: '/ads/BannerAds-Placeholder.png',
});

/**
 * Location photo fallback for city headers (not AdSense chrome).
 * Withdrawn — heroes use a black base until the map (or a real photo) loads.
 */
export const CITY_HERO_IMAGE_FALLBACK = null;

/** @deprecated Alias — AdSlot placeholders use AD_PLACEHOLDER_IMAGES. */
export const AD_PLACEHOLDER_UNSPLASH = AD_PLACEHOLDER_IMAGES;

export function getAdPlaceholderImage(placement) {
  return AD_PLACEHOLDER_IMAGES[placement] ?? AD_PLACEHOLDER_IMAGES.default;
}

export function isHeroAdPlacement(placement) {
  return placement === 'hero';
}

export function isSquareAdPlacement(placement) {
  return placement === 'hero';
}
