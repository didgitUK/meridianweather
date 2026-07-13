export const DAILY_LIMIT = 1000;
export const WARNING_THRESHOLD = 800;
export const SOFT_BLOCK_THRESHOLD = 950;
export const PER_MINUTE_LIMIT = 60;
export const MAX_SAVED_CITIES = 10;
export const DEBOUNCE_MS = 300;
export const DEFAULT_REFRESH_INTERVAL_MS = 60 * 60 * 1000;
export const DEFAULT_STALE_CACHE_MAX_MS = 2 * 60 * 60 * 1000;
export const DASHBOARD_CURRENT_MAX_AGE_MS = 10 * 60 * 1000;

export const SCOPE_TTL = {
  current: { fresh: DEFAULT_REFRESH_INTERVAL_MS, stale: DEFAULT_STALE_CACHE_MAX_MS },
  hourly: { fresh: 2 * 60 * 60 * 1000, stale: 6 * 60 * 60 * 1000 },
  daily: { fresh: 6 * 60 * 60 * 1000, stale: 12 * 60 * 60 * 1000 },
  minutely: { fresh: 15 * 60 * 1000, stale: 30 * 60 * 1000 },
  geocode: { fresh: 7 * 24 * 60 * 60 * 1000, stale: 30 * 24 * 60 * 60 * 1000 },
  alert: { fresh: 60 * 60 * 1000, stale: 6 * 60 * 60 * 1000 },
};

export const REFRESH_OPTIONS = [
  { label: '10 minutes', value: 10 * 60 * 1000 },
  { label: '15 minutes', value: 15 * 60 * 1000 },
  { label: '30 minutes', value: 30 * 60 * 1000 },
  { label: '1 hour', value: 60 * 60 * 1000 },
  { label: '2 hours', value: 2 * 60 * 60 * 1000 },
];
