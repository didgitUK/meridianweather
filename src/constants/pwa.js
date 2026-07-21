/** PWA install, offline cache, and background refresh constants. */

export const PWA_PERIODIC_SYNC_TAG = 'meridian-daily-weather';
export const PWA_DAILY_INTERVAL_MS = 24 * 60 * 60 * 1000;
/** Recent (non-pinned) cities included in background prefetch. */
export const PWA_PRIORITY_RECENT_LIMIT = 3;
/** Hard cap on cities refreshed per device (pins + recent). */
export const PWA_MAX_PRIORITY_CITIES = 12;
/** Max unique cities warmed per daily push cron run (quota guard). */
export const PWA_CRON_WARM_CITY_CAP = 40;
/** Offline emergency window for pinned / priority cities before forcing a reconnect message. */
export const PWA_EMERGENCY_STALE_MAX_MS = 48 * 60 * 60 * 1000;

export const PWA_NOTIFY_MODES = Object.freeze({
  daily: 'daily',
  severe: 'severe',
  both: 'both',
});

export const PWA_NOTIFY_MODE_VALUES = Object.freeze(Object.values(PWA_NOTIFY_MODES));

export function normalizePwaNotifyMode(value) {
  if (typeof value !== 'string') {
    return PWA_NOTIFY_MODES.daily;
  }
  return PWA_NOTIFY_MODE_VALUES.includes(value) ? value : PWA_NOTIFY_MODES.daily;
}

export const PWA_META_CACHE = 'meridian-meta-v1';
export const PWA_SHELL_CACHE = 'meridian-shell-v1';
export const PWA_RUNTIME_CACHE = 'meridian-runtime-v1';
export const PWA_WEATHER_CACHE = 'meridian-weather-v1';
/** Synthetic Cache API URL — readable by the service worker when the app is closed. */
export const PWA_PRIORITY_CITIES_URL = '/__meridian/priority-cities.json';

export const PWA_PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/brand/favicon.png',
  '/brand/icon-512.png',
  '/brand/icon-maskable-512.png',
  '/brand/apple-touch-icon.png',
];
