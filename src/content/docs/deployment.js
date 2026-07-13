export const deploymentDoc = {
  slug: 'deployment',
  title: 'Deployment & environment',
  lastUpdated: '2026-07-09',
  sections: [
    {
      id: 'env-required',
      title: 'Required environment',
      body:
        'OPENWEATHER_API_KEY — required for weather and geocode. DATABASE_PATH — SQLite file (default ./data/meridian.db); must be persistent volume in production so cache and subscriptions survive restarts. UNSPLASH_ACCESS_KEY — optional; enables location-based dashboard hero photos (server-only, cached in hero_image_cache).',
    },
    {
      id: 'env-email',
      title: 'Email environment',
      body:
        'RESEND_API_KEY — enables sending. RESEND_FROM_EMAIL — verified sender. NEXT_PUBLIC_APP_URL — base URL for unsubscribe links in emails (not in .env.example but required in production).',
    },
    {
      id: 'env-cron',
      title: 'Cron and admin',
      body:
        'CRON_SECRET — Bearer token for /api/cron/* routes. ADMIN_SECRET — x-admin-secret for /api/admin/*; unset allows bypass (dev/review only). Schedule cron externally: weekly-digests (e.g. Monday morning), weather-alerts (e.g. every 15–30 minutes).',
    },
    {
      id: 'env-adsense',
      title: 'AdSense environment',
      body:
        'GOOGLE_ADSENSE_CLIENT_ID (ca-pub-…). GOOGLE_ADSENSE_SLOT_DASHBOARD, SLOT_HERO, SLOT_RECENT, SLOT_DEFAULT — display unit IDs. Keep client ID in host secrets only. /ads.txt generated at runtime from client ID.',
    },
    {
      id: 'scripts',
      title: 'npm scripts',
      body:
        'dev, build, start — Next.js. lint, test, verify — quality gate. copy:icons — Meteocons to public (also postinstall). seed:checks — North England demo snapshots. email — React Email preview server.',
    },
    {
      id: 'sqlite',
      title: 'SQLite tables',
      body:
        'weather_snapshots, api_call_log, subscriptions, subscription_send_log, platform_settings (singleton), hero_image_cache. Schema in src/lib/db/index.js. First open seeds platform_settings with refresh 1h, stale 2h, daily limit 1000, soft block 950.',
    },
    {
      id: 'middleware',
      title: 'Middleware',
      body:
        'src/middleware.js rewrites docs.localhost host to /docs for local documentation subdomain. No auth middleware on main app routes.',
    },
    {
      id: 'localstorage-keys',
      title: 'Browser storage keys',
      body:
        'meridian:saved-cities, meridian:client-id, meridian:weather-cache, meridian:theme, meridian:subscriptions, meridian:consent, meridian:tier, meridian:cookie-consent. Custom event meridian:storage syncs hooks after writes.',
    },
  ],
};
