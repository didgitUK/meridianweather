export function getCountryLabel(countryCode, locale = 'en') {
  if (!countryCode || countryCode.length !== 2) {
    return null;
  }

  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(countryCode.toUpperCase());
  } catch {
    return countryCode.toUpperCase();
  }
}
