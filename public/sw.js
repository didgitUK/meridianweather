/* Meridian service worker — caching, daily periodic sync, push refresh. */
/* global self, caches, clients, fetch, Response, URL, Headers */

importScripts('/pwa-constants.js');

const CFG = self.MERIDIAN_PWA;

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isWeatherApi(url) {
  return (
    url.pathname === '/api/weather'
    || url.pathname === '/api/weather/batch'
  );
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/weather-icons/')
    || url.pathname.startsWith('/brand/')
    || url.pathname === '/manifest.webmanifest'
    || url.pathname === '/offline.html'
    || url.pathname === '/pwa-constants.js'
  );
}

function shouldBypassCache(url) {
  return (
    url.pathname.startsWith('/api/admin')
    || url.pathname.startsWith('/api/cron')
    || url.pathname.startsWith('/api/push')
    || url.pathname.startsWith('/admin')
  );
}

async function precacheShell() {
  const cache = await caches.open(CFG.SHELL_CACHE);
  await cache.addAll(CFG.PRECACHE_URLS);
}

async function readPriorityCities() {
  try {
    const cache = await caches.open(CFG.META_CACHE);
    const response = await cache.match(CFG.PRIORITY_CITIES_URL);
    if (!response) {
      return [];
    }
    const payload = await response.json();
    return Array.isArray(payload?.cities) ? payload.cities : [];
  } catch {
    return [];
  }
}

async function refreshPriorityWeather(trigger) {
  const cities = await readPriorityCities();
  if (cities.length === 0) {
    return { refreshed: 0 };
  }

  const body = {
    cities: cities.map((city) => ({
      lat: city.lat,
      lon: city.lon,
      scopes: CFG.PREFETCH_SCOPES,
      trigger,
    })),
    trigger,
  };

  const response = await fetch('/api/weather/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Weather batch failed (${response.status})`);
  }

  const weatherCache = await caches.open(CFG.WEATHER_CACHE);
  const json = await response.json();
  const stableKey = '/__meridian/weather-batch-latest.json';
  await weatherCache.put(
    stableKey,
    new Response(JSON.stringify({
      fetchedAt: new Date().toISOString(),
      trigger,
      cities: json.cities ?? [],
      requestCities: cities,
    }), {
      headers: { 'Content-Type': 'application/json' },
    }),
  );

  const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clientsList) {
    client.postMessage({
      type: 'meridian:weather-refreshed',
      trigger,
      fetchedAt: new Date().toISOString(),
      cityCount: cities.length,
      batch: json,
      requestCities: cities,
    });
  }

  return { refreshed: cities.length };
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    precacheShell()
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([
        CFG.SHELL_CACHE,
        CFG.RUNTIME_CACHE,
        CFG.WEATHER_CACHE,
        CFG.META_CACHE,
      ]);
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith('meridian-') && !keep.has(key))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || typeof data !== 'object') {
    return;
  }

  if (data.type === 'meridian:skip-waiting') {
    self.skipWaiting();
  }

  if (data.type === 'meridian:refresh-priority') {
    event.waitUntil(refreshPriorityWeather(data.trigger || CFG.TRIGGER_PERIODIC));
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag !== CFG.PERIODIC_SYNC_TAG) {
    return;
  }
  event.waitUntil(refreshPriorityWeather(CFG.TRIGGER_PERIODIC));
});

self.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
      let payload = { type: 'meridian-daily-refresh' };
      try {
        if (event.data) {
          payload = event.data.json();
        }
      } catch {
        // Keep default payload.
      }

      const trigger = payload.trigger || CFG.TRIGGER_PUSH;
      let refreshed = 0;
      try {
        const result = await refreshPriorityWeather(trigger);
        refreshed = result.refreshed;
      } catch {
        // Still notify so iOS accepts the push wake.
      }

      const title = payload.title || 'meridian';
      const body = payload.body
        || (refreshed > 0
          ? `Updated weather for ${refreshed} place${refreshed === 1 ? '' : 's'} on this device.`
          : 'Your pinned places are ready when you open the app.');

      await self.registration.showNotification(title, {
        body,
        icon: '/brand/icon-512.png',
        badge: '/brand/favicon.png',
        tag: 'meridian-daily-refresh',
        renotify: false,
        data: { url: payload.url || '/' },
      });
    })(),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || '/';
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of allClients) {
        if ('focus' in client) {
          await client.focus();
          if ('navigate' in client) {
            await client.navigate(targetUrl);
          }
          return;
        }
      }
      await self.clients.openWindow(targetUrl);
    })(),
  );
});

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }
  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    // Allow POST weather batch to fall through; offline POST cannot use Cache match easily.
    return;
  }

  const url = new URL(request.url);
  if (!isSameOrigin(url) || shouldBypassCache(url)) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          const cache = await caches.open(CFG.SHELL_CACHE);
          cache.put(request, response.clone());
          return response;
        } catch {
          const cache = await caches.open(CFG.SHELL_CACHE);
          return (
            (await cache.match(request))
            || (await cache.match('/'))
            || (await cache.match('/offline.html'))
            || Response.error()
          );
        }
      })(),
    );
    return;
  }

  if (isWeatherApi(url)) {
    event.respondWith(networkFirst(request, CFG.WEATHER_CACHE));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, CFG.RUNTIME_CACHE));
    return;
  }

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, CFG.RUNTIME_CACHE));
  }
});
