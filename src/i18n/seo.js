import { getTranslations } from 'next-intl/server';
import { openWeatherLangByLocale, ogLocaleByLocale } from '@/i18n/locales';
import { routing } from '@/i18n/routing';
import { absoluteUrl } from '@/lib/seo';

export function getOpenWeatherLang(locale) {
  return openWeatherLangByLocale[locale] ?? 'en';
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
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, absoluteUrl(buildLocalizedPath(path, locale))]),
  );
}

export function getSeoTranslator(namespace = 'Seo') {
  return getTranslations(namespace);
}
