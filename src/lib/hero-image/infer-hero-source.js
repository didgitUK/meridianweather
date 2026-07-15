import { HERO_SOURCE } from '@/constants/hero-sources';

/**
 * Infer provider from source / CDN URLs when cache rows omit sourceName.
 *
 * @param {string | null | undefined} sourceUrl
 * @param {string | null | undefined} imageUrl
 */
export function inferHeroSourceName(sourceUrl, imageUrl) {
  const haystack = `${sourceUrl ?? ''} ${imageUrl ?? ''}`.toLowerCase();

  if (haystack.includes('unsplash.com')) {
    return HERO_SOURCE.UNSPLASH;
  }

  if (
    haystack.includes('wikimedia.org')
    || haystack.includes('wikipedia.org')
  ) {
    return HERO_SOURCE.WIKIMEDIA;
  }

  if (haystack.includes('pexels.com')) {
    return HERO_SOURCE.PEXELS;
  }

  return null;
}
