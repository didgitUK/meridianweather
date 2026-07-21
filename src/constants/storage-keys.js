/**
 * Browser localStorage keys (single source of truth for client persistence).
 *
 * Ownership notes:
 * - `userLocation` — home / GPS / IP profile (checks + countryCounts live here too)
 * - `checkedCities` — recent city detail lookups (also appends into userLocation history)
 * - `savedCities` — pinned locations only
 * - `weatherCache` — L0 weather payloads; written silently (no meridian:storage) to
 *   avoid fan-out of location/subscription listeners on every weather write
 * - `consent` — canonical privacy JSON; `cookieConsent` is a legacy banner flag still
 *   written on accept for older readers
 * - `tier` — legacy reserved key
 * - `adfree` — signed ad-free license mirror (cookie is source of truth)
 */
export const STORAGE_KEYS = {
  clientId: 'meridian:client-id',
  savedCities: 'meridian:saved-cities',
  checkedCities: 'meridian:checked-cities',
  userLocation: 'meridian:user-location',
  weatherCache: 'meridian:weather-cache',
  theme: 'meridian:theme',
  cookieConsent: 'meridian:cookie-consent',
  subscriptions: 'meridian:subscriptions',
  tier: 'meridian:tier',
  adfree: 'meridian:adfree',
  consent: 'meridian:consent',
  accessibility: 'meridian:accessibility',
  cityDetailAccordion: 'meridian:city-detail-accordion',
  temperatureUnit: 'meridian:temperature-unit',
  preferredLocale: 'meridian:preferred-locale',
  weatherRefreshMode: 'meridian:weather-refresh-mode',
};
