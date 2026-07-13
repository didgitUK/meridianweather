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

/** Demo ad creatives when AdSense is unset, blocked, or failing. */
export const AD_PLACEHOLDER_IMAGES = Object.freeze({
  dashboard: '/ads/placeholder-leaderboard.svg',
  'city-detail': '/ads/placeholder-rectangle.svg',
  default: '/ads/placeholder-rectangle.svg',
});

export function getAdPlaceholderImage(placement) {
  return AD_PLACEHOLDER_IMAGES[placement] ?? AD_PLACEHOLDER_IMAGES.default;
}
