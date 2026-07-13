export {
  gettingStartedDoc,
  dashboardDoc,
  cityDetailDoc,
  forecastsDoc,
  recentChecksDoc,
  subscriptionsDoc,
  apiLimitsDoc,
  monetizationDoc,
  apiReferenceDoc,
  weatherIconsDoc,
  deploymentDoc,
} from '@/content/docs/defaults';

export {
  getDocsPages,
  getDocBySlug,
} from '@/lib/cms/get-cms-content';

// DOCS_PAGES kept as alias of file defaults for static consumers; prefer getDocsPages() for rendered pages.
export { DOCS_PAGES, DOCS_PAGES as DOCS_PAGE_DEFAULTS } from '@/content/docs/defaults';
