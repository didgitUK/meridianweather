import { buildLocalizedPath, buildLanguageAlternates, getOgLocale } from '@/i18n/seo';
import { buildPageMetadata, excerptFromBody } from '@/lib/seo';
import { isDocsNoindexSlug, resolveRobots } from '@/lib/seo-indexability';

export function buildDocPageMetadata(doc, locale) {
  const path = `/docs/${doc.slug}`;

  return buildPageMetadata({
    title: doc.title,
    description: excerptFromBody(doc.sections[0]?.body),
    path: buildLocalizedPath(path, locale),
    modifiedTime: doc.lastUpdated,
    locale: getOgLocale(locale),
    languages: buildLanguageAlternates(path),
    robots: resolveRobots({
      locale,
      noindex: isDocsNoindexSlug(doc.slug),
    }),
  });
}

export function buildLegalPageMetadata(policy, locale) {
  const path = `/legal/${policy.slug}`;

  return buildPageMetadata({
    title: policy.title,
    description: excerptFromBody(policy.sections[0]?.body),
    path: buildLocalizedPath(path, locale),
    modifiedTime: policy.lastUpdated,
    locale: getOgLocale(locale),
    languages: buildLanguageAlternates(path),
    robots: resolveRobots({ locale }),
  });
}
