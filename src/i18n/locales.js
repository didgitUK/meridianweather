export const locales = ['en', 'en-GB', 'de', 'fr', 'es', 'ja', 'ar'];

export const defaultLocale = 'en';

export const localeLabels = {
  en: 'English',
  'en-GB': 'English (UK)',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  ja: '日本語',
  ar: 'العربية',
};

/** Native / endonym search aliases for the language picker. */
export const localeSearchTerms = {
  en: ['english', 'us', 'united states', 'american', 'en'],
  'en-GB': ['english', 'uk', 'united kingdom', 'british', 'gb', 'en-gb'],
  de: ['deutsch', 'german', 'germany', 'de'],
  fr: ['français', 'francais', 'french', 'france', 'fr'],
  es: ['español', 'espanol', 'spanish', 'spain', 'es'],
  ja: ['日本語', 'japanese', 'japan', 'ja'],
  ar: ['العربية', 'arabic', 'ar'],
};

/** ISO country codes for flag emoji (see countryCodeToFlagEmoji). */
export const localeFlagCountry = {
  en: 'US',
  'en-GB': 'GB',
  de: 'DE',
  fr: 'FR',
  es: 'ES',
  ja: 'JP',
  ar: 'AE',
};

/**
 * Preferred temperature unit by locale / region.
 * US English → °F; remaining shipped locales → °C.
 */
export const localeTemperatureUnit = {
  en: 'fahrenheit',
  'en-GB': 'celsius',
  de: 'celsius',
  fr: 'celsius',
  es: 'celsius',
  ja: 'celsius',
  ar: 'celsius',
};

export const openWeatherLangByLocale = {
  en: 'en',
  'en-GB': 'en',
  de: 'de',
  fr: 'fr',
  es: 'es',
  ja: 'ja',
  ar: 'ar',
};

/** Allowed OpenWeather `lang` query values for meridian locales. */
export const OPENWEATHER_LANGS = Object.freeze(
  [...new Set(Object.values(openWeatherLangByLocale))],
);

/**
 * @param {string | null | undefined} locale
 * @returns {string}
 */
export function resolveOpenWeatherLang(locale) {
  return openWeatherLangByLocale[locale] ?? 'en';
}

/**
 * @param {unknown} lang
 * @returns {string | null} Normalized lang or null if invalid.
 */
export function normalizeOpenWeatherLang(lang) {
  if (typeof lang !== 'string' || lang.length === 0) {
    return null;
  }

  const normalized = lang.trim().toLowerCase();
  return OPENWEATHER_LANGS.includes(normalized) ? normalized : null;
}

export const ogLocaleByLocale = {
  en: 'en_US',
  'en-GB': 'en_GB',
  de: 'de_DE',
  fr: 'fr_FR',
  es: 'es_ES',
  ja: 'ja_JP',
  ar: 'ar_AE',
};

export function getLocaleLabel(locale) {
  return localeLabels[locale] ?? locale;
}

export function getLocaleFlagCountry(locale) {
  return localeFlagCountry[locale] ?? 'GB';
}

export function getDefaultTemperatureUnitForLocale(locale) {
  return localeTemperatureUnit[locale] ?? 'celsius';
}

export function filterLocales(query) {
  const q = String(query ?? '').trim().toLowerCase();
  if (!q) {
    return [...locales];
  }

  return locales.filter((locale) => {
    const label = getLocaleLabel(locale).toLowerCase();
    const terms = localeSearchTerms[locale] ?? [];
    return (
      locale.toLowerCase().includes(q)
      || label.includes(q)
      || terms.some((term) => term.includes(q) || q.includes(term))
    );
  });
}
