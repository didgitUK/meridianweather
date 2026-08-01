import { getTranslations } from 'next-intl/server';
import { ogLocaleByLocale, resolveOpenWeatherLang } from '@/i18n/locales';
import { routing } from '@/i18n/routing';
import { absoluteUrl } from '@/lib/seo';
import { SEARCH_INDEX_LOCALES } from '@/lib/seo-indexability';

export function getOpenWeatherLang(locale) {
  return resolveOpenWeatherLang(locale);
}

export function getOgLocale(locale) {
  return ogLocaleByLocale[locale] ?? 'en_GB';
}

export function buildLocalizedPath(path, locale) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (locale === routing.defaultLocale) {
    return normalizedPath;
  }

  return `/${locale}${normalizedPath === '/' ? '' : normalizedPath}`;
}

export function buildLanguageAlternates(path) {
  const locales = routing.locales.filter((locale) =>
    SEARCH_INDEX_LOCALES.includes(locale),
  );

  return Object.fromEntries(
    locales.map((locale) => [locale, absoluteUrl(buildLocalizedPath(path, locale))]),
  );
}

export function getSeoTranslator(namespace = 'Seo') {
  return getTranslations(namespace);
}
