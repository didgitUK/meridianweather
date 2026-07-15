import { CMS_COLLECTION } from '@/constants/cms';
import { getCmsPage, listCmsPages } from '@/lib/cms/cms-page-repo';
import {
  getLocalizedLegalPolicies,
  getLocalizedLegalPolicy,
} from '@/content/legal/i18n';
import {
  getLocalizedDocsPages,
  getLocalizedDoc,
} from '@/content/docs/i18n';

function toPublicPage(page) {
  if (!page) {
    return null;
  }

  return {
    slug: page.slug,
    title: page.title,
    lastUpdated: page.lastUpdated,
    sections: page.sections,
  };
}

/**
 * @param {string | null | undefined} [locale]
 */
export function getLegalPolicies(locale) {
  const localized = getLocalizedLegalPolicies(locale);
  if (localized) {
    return localized.map(toPublicPage);
  }

  return listCmsPages(CMS_COLLECTION.LEGAL).map(toPublicPage);
}

/**
 * @param {string} slug
 * @param {string | null | undefined} [locale]
 */
export function getPolicyBySlug(slug, locale) {
  const localized = getLocalizedLegalPolicy(locale, slug);
  if (localized) {
    return toPublicPage(localized);
  }

  return toPublicPage(getCmsPage(CMS_COLLECTION.LEGAL, slug));
}

/**
 * @param {string | null | undefined} [locale]
 */
export function getDocsPages(locale) {
  const localized = getLocalizedDocsPages(locale);
  if (localized) {
    return localized.map(toPublicPage);
  }

  return listCmsPages(CMS_COLLECTION.DOCS).map(toPublicPage);
}

/**
 * @param {string} slug
 * @param {string | null | undefined} [locale]
 */
export function getDocBySlug(slug, locale) {
  const localized = getLocalizedDoc(locale, slug);
  if (localized) {
    return toPublicPage(localized);
  }

  return toPublicPage(getCmsPage(CMS_COLLECTION.DOCS, slug));
}
