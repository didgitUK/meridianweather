/**
 * Why a weather check was served — orthogonal to provider (`source`).
 */
export const WEATHER_CHECK_TRIGGERS = Object.freeze({
  dashboardLoad: 'dashboard_load',
  dashboardRefresh: 'dashboard_refresh',
  cityDetail: 'city_detail',
  searchPreview: 'search_preview',
  searchSelect: 'search_select',
  cronAlerts: 'cron_alerts',
  cronDigest: 'cron_digest',
  showcaseHydrate: 'showcase_hydrate',
  historyRead: 'history_read',
  alertDetail: 'alert_detail',
  adminConnectionCheck: 'admin_connection_check',
  geocodeSearch: 'geocode_search',
  geocodeReverse: 'geocode_reverse',
  /** Historic rows recorded before triggers were wired. */
  legacyUntagged: 'legacy_untagged',
  /** Soft fallback only — prefer fixing the caller instead of writing this. */
  unknown: 'unknown',
});

export const WEATHER_CHECK_TRIGGER_VALUES = Object.freeze(
  Object.values(WEATHER_CHECK_TRIGGERS),
);

export const WEATHER_CHECK_TRIGGER_LABELS = Object.freeze({
  [WEATHER_CHECK_TRIGGERS.dashboardLoad]: 'Dashboard load',
  [WEATHER_CHECK_TRIGGERS.dashboardRefresh]: 'Dashboard refresh',
  [WEATHER_CHECK_TRIGGERS.cityDetail]: 'City detail',
  [WEATHER_CHECK_TRIGGERS.searchPreview]: 'Search preview',
  [WEATHER_CHECK_TRIGGERS.searchSelect]: 'Search select',
  [WEATHER_CHECK_TRIGGERS.cronAlerts]: 'Cron alerts',
  [WEATHER_CHECK_TRIGGERS.cronDigest]: 'Cron digest',
  [WEATHER_CHECK_TRIGGERS.showcaseHydrate]: 'Showcase hydrate',
  [WEATHER_CHECK_TRIGGERS.historyRead]: 'History read',
  [WEATHER_CHECK_TRIGGERS.alertDetail]: 'Alert detail',
  [WEATHER_CHECK_TRIGGERS.adminConnectionCheck]: 'Admin connection check',
  [WEATHER_CHECK_TRIGGERS.geocodeSearch]: 'Geocode search',
  [WEATHER_CHECK_TRIGGERS.geocodeReverse]: 'Geocode reverse',
  [WEATHER_CHECK_TRIGGERS.legacyUntagged]: 'Legacy (pre-tagging)',
  [WEATHER_CHECK_TRIGGERS.unknown]: 'Unknown',
});

export const WEATHER_CHECK_CACHE_OUTCOMES = Object.freeze({
  upstream: 'upstream',
  memory: 'memory',
  sqlite: 'sqlite',
});

export function normalizeWeatherCheckTrigger(value) {
  if (typeof value !== 'string') {
    return WEATHER_CHECK_TRIGGERS.unknown;
  }

  return WEATHER_CHECK_TRIGGER_VALUES.includes(value)
    ? value
    : WEATHER_CHECK_TRIGGERS.unknown;
}

export function mapCacheLayerToOutcome(cacheLayer) {
  if (cacheLayer === 'memory') {
    return WEATHER_CHECK_CACHE_OUTCOMES.memory;
  }

  if (cacheLayer === 'database' || cacheLayer === 'sqlite') {
    return WEATHER_CHECK_CACHE_OUTCOMES.sqlite;
  }

  if (cacheLayer === 'upstream') {
    return WEATHER_CHECK_CACHE_OUTCOMES.upstream;
  }

  return WEATHER_CHECK_CACHE_OUTCOMES.sqlite;
}

export function labelWeatherCheckTrigger(trigger) {
  return WEATHER_CHECK_TRIGGER_LABELS[trigger] ?? WEATHER_CHECK_TRIGGER_LABELS.unknown;
}
