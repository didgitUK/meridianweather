/**
 * Resolve public long-form content by UI locale.
 * English / en-GB use CMS or English file defaults; other locales prefer i18n packs.
 */

export const ENGLISH_CONTENT_LOCALES = new Set(['en', 'en-GB']);

/**
 * @param {string | null | undefined} locale
 * @returns {boolean}
 */
export function usesEnglishContentPack(locale) {
  return !locale || ENGLISH_CONTENT_LOCALES.has(locale);
}
