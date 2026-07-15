/**
 * Active BCP-47 locale for forecast date/time formatting.
 * Synced from HtmlAttributes when the UI locale changes.
 */

let activeDateLocale = 'en-GB';

/**
 * @param {string | null | undefined} uiLocale next-intl locale
 * @returns {string}
 */
export function resolveDateLocale(uiLocale) {
  if (!uiLocale) {
    return 'en-GB';
  }

  if (uiLocale === 'en') {
    return 'en-US';
  }

  return uiLocale;
}

/**
 * @param {string | null | undefined} uiLocale
 */
export function setActiveDateLocale(uiLocale) {
  activeDateLocale = resolveDateLocale(uiLocale);
}

export function getActiveDateLocale() {
  return activeDateLocale;
}
