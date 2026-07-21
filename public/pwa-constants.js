/**
 * Keep in sync with src/constants/pwa.js (service worker cannot import app modules).
 */
self.MERIDIAN_PWA = {
  PERIODIC_SYNC_TAG: 'meridian-daily-weather',
  META_CACHE: 'meridian-meta-v1',
  SHELL_CACHE: 'meridian-shell-v1',
  RUNTIME_CACHE: 'meridian-runtime-v1',
  WEATHER_CACHE: 'meridian-weather-v1',
  PRIORITY_CITIES_URL: '/__meridian/priority-cities.json',
  PRECACHE_URLS: [
    '/',
    '/offline.html',
    '/manifest.webmanifest',
    '/brand/favicon.png',
    '/brand/icon-512.png',
    '/brand/icon-maskable-512.png',
    '/brand/apple-touch-icon.png',
  ],
  PREFETCH_SCOPES: ['current', 'daily'],
  TRIGGER_PERIODIC: 'pwa_periodic_sync',
  TRIGGER_PUSH: 'pwa_push_refresh',
};
