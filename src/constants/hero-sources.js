/** Hero image provider ids stored on resolved variants. */
export const HERO_SOURCE = Object.freeze({
  UNSPLASH: 'unsplash',
  WIKIMEDIA: 'wikimedia',
  PEXELS: 'pexels',
});

/** User-facing labels for credit lines. */
export const HERO_SOURCE_LABEL = Object.freeze({
  [HERO_SOURCE.UNSPLASH]: 'Unsplash',
  [HERO_SOURCE.WIKIMEDIA]: 'Wikimedia Commons',
  [HERO_SOURCE.PEXELS]: 'Pexels',
});

/**
 * @param {string | null | undefined} sourceName
 */
export function getHeroSourceLabel(sourceName) {
  if (!sourceName) {
    return HERO_SOURCE_LABEL[HERO_SOURCE.UNSPLASH];
  }

  return HERO_SOURCE_LABEL[sourceName] ?? sourceName;
}
