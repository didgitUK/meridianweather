import { DOCS_PAGE_DEFAULTS } from '@/content/docs';
import { LEGAL_POLICY_DEFAULTS } from '@/content/legal';
import { listBlogPostSlugs } from '@/lib/cms/blog-post-repo';
import { listIndexableCities } from '@/lib/location-repo';
import {
  countUkPlaces,
  listUkPlaces,
  seedAllUkPlaces,
} from '@/lib/places/uk-places-repo';
import { getShowcaseCities } from '@/lib/resolve-city';
import { routing } from '@/i18n/routing';

function getStaticPaths() {
  return [
    '',
    '/docs',
    '/journal',
    '/search',
    ...listBlogPostSlugs().map((slug) => `/journal/${slug}`),
    ...DOCS_PAGE_DEFAULTS.map((page) => `/docs/${page.slug}`),
    ...LEGAL_POLICY_DEFAULTS.map((policy) => `/legal/${policy.slug}`),
  ];
}

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

export function getWeatherPlaceSitemapEntries() {
  if (countUkPlaces() === 0) {
    seedAllUkPlaces();
  }

  return listUkPlaces({ limit: 5000 }).map((place) => ({
    path: `/weather/${place.slug}`,
    lastModified: new Date(place.updatedAt ?? Date.now()),
  }));
}

export function getLocalizedSitemapEntries() {
  const cityPaths = getCitySitemapEntries();
  const weatherPaths = getWeatherPlaceSitemapEntries();
  const staticPaths = getStaticPaths();
  const entries = [];

  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;

    for (const path of staticPaths) {
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
        priority: 0.85,
      });
    }

    for (const place of weatherPaths) {
      const localizedPath = `${prefix}${place.path}`;
      const languages = Object.fromEntries(
        routing.locales.map((entryLocale) => {
          const entryPrefix = entryLocale === routing.defaultLocale ? '' : `/${entryLocale}`;
          return [entryLocale, `${entryPrefix}${place.path}`];
        }),
      );

      entries.push({
        path: localizedPath,
        languages,
        lastModified: place.lastModified,
        changeFrequency: 'daily',
        priority: 0.95,
      });
    }
  }

  return entries;
}
