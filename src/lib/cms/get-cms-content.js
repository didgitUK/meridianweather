import { CMS_COLLECTION } from '@/constants/cms';
import { getCmsPage, listCmsPages } from '@/lib/cms/cms-page-repo';

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

export function getLegalPolicies() {
  return listCmsPages(CMS_COLLECTION.LEGAL).map(toPublicPage);
}

export function getPolicyBySlug(slug) {
  return toPublicPage(getCmsPage(CMS_COLLECTION.LEGAL, slug));
}

export function getDocsPages() {
  return listCmsPages(CMS_COLLECTION.DOCS).map(toPublicPage);
}

export function getDocBySlug(slug) {
  return toPublicPage(getCmsPage(CMS_COLLECTION.DOCS, slug));
}
