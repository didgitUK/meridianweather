import { usesEnglishContentPack } from '@/content/locale-content';
import { DOCS_PAGES_I18N as de } from './de';
import { DOCS_PAGES_I18N as fr } from './fr';
import { DOCS_PAGES_I18N as es } from './es';
import { DOCS_PAGES_I18N as ja } from './ja';
import { DOCS_PAGES_I18N as ar } from './ar';

export const docsPagesByLocale = { de, fr, es, ja, ar };

/**
 * @param {string | null | undefined} locale
 * @returns {typeof de | null}
 */
export function getLocalizedDocsPages(locale) {
  if (usesEnglishContentPack(locale)) return null;
  return docsPagesByLocale[locale] ?? null;
}

/**
 * @param {string | null | undefined} locale
 * @param {string} slug
 * @returns {object | null}
 */
export function getLocalizedDoc(locale, slug) {
  const pages = getLocalizedDocsPages(locale);
  if (!pages) return null;
  return pages.find((page) => page.slug === slug) ?? null;
}
