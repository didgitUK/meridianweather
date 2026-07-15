import { DOCS_PAGE_DEFAULTS } from '@/content/docs';
import { LEGAL_POLICY_DEFAULTS } from '@/content/legal';
import { HOME_BLOG_POSTS } from '@/constants/blog-posts';
import { listIndexableCities } from '@/lib/location-repo';
import { getShowcaseCities } from '@/lib/resolve-city';
import { routing } from '@/i18n/routing';

const STATIC_PATHS = [
  '',
  '/docs',
  '/journal',
  '/search',
  ...HOME_BLOG_POSTS.map((post) => post.href),
  ...DOCS_PAGE_DEFAULTS.map((page) => `/docs/${page.slug}`),
  ...LEGAL_POLICY_DEFAULTS.map((policy) => `/legal/${policy.slug}`),
];

export function getCitySitemapEntries() {
  const entries = new Map();

  for (const city of getShowcaseCities()) {
    entries.set(city.id, {
      path: `/city/${city.id}`,
      lastModified: new Date(),
    });
  }

  for (const location of listIndexableCities()) {
    if (!location.citySlug) {
      continue;
    }

    entries.set(location.citySlug, {
      path: `/city/${location.citySlug}`,
      lastModified: new Date(location.updatedAt ?? location.indexableAt ?? Date.now()),
    });
  }

  return [...entries.values()];
}

export function getLocalizedSitemapEntries() {
  const cityPaths = getCitySitemapEntries();
  const entries = [];

  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;

    for (const path of STATIC_PATHS) {
      const localizedPath = `${prefix}${path}`;
      const languages = Object.fromEntries(
        routing.locales.map((entryLocale) => {
          const entryPrefix = entryLocale === routing.defaultLocale ? '' : `/${entryLocale}`;
          return [entryLocale, `${entryPrefix}${path}`];
        }),
      );

      entries.push({
        path: localizedPath,
        languages,
        lastModified: new Date(),
        changeFrequency: path.startsWith('/docs') ? 'weekly' : 'monthly',
        priority: path === '' ? 1 : 0.7,
      });
    }

    for (const city of cityPaths) {
      const localizedPath = `${prefix}${city.path}`;
      const languages = Object.fromEntries(
        routing.locales.map((entryLocale) => {
          const entryPrefix = entryLocale === routing.defaultLocale ? '' : `/${entryLocale}`;
          return [entryLocale, `${entryPrefix}${city.path}`];
        }),
      );

      entries.push({
        path: localizedPath,
        languages,
        lastModified: city.lastModified,
        changeFrequency: 'hourly',
        priority: 0.9,
      });
    }
  }

  return entries;
}
