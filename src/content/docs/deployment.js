export const deploymentDoc = {
  slug: 'deployment',
  title: 'Deployment & environment',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'env-required',
      title: 'Required environment',
      body:
        'OPENWEATHER_API_KEY — required for weather and geocode. DATABASE_PATH — SQLite file (default ./data/meridian.db); must be persistent volume in production so cache and subscriptions survive restarts.',
    },
    {
      id: 'env-hero',
      title: 'Hero image environment',
      body:
        'UNSPLASH_ACCESS_KEY — optional; first photo provider for location heroes (server-only, cached in hero_image_cache). PEXELS_API_KEY — optional third provider after Unsplash and Wikimedia Commons. NEXT_PUBLIC_CITY_HERO_OSM — set to 0 to disable satellite map header (default on). NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1 — opt-in Google Street View when OSM is off. NEXT_PUBLIC_GOOGLE_MAPS_API_KEY — optional Maps Embed API key for Street View iframes.',
    },
    {
      id: 'env-email',
      title: 'Email environment',
      body:
        'Multi-ESP via active connector in platform_settings (admin picker): Resend (RESEND_API_KEY, RESEND_FROM_EMAIL), SendGrid (SENDGRID_API_KEY, SENDGRID_FROM_EMAIL), Amazon SES (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SES_REGION, AWS_SES_FROM_EMAIL), or SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL, SMTP_SECURE). NEXT_PUBLIC_APP_URL — base URL for unsubscribe links in emails (listed in .env.example; required in production).',
    },
    {
      id: 'env-cron',
      title: 'Cron and admin',
      body:
        'CRON_SECRET — Bearer for /api/cron/* (denied when unset in production). ADMIN_SECRET — signs the admin session cookie and encrypts connector secrets. ADMIN_PASSWORD — root login for ADMIN_EMAIL only. Dev bypass only when NODE_ENV=development, ALLOW_DEV_ADMIN_BYPASS=1, and ADMIN_SECRET unset. See docs/SECURITY.md. Schedule cron externally: weekly-digests (e.g. Monday morning), weather-alerts (e.g. every 15–30 minutes).',
    },
    {
      id: 'env-adsense',
      title: 'AdSense environment',
      body:
        'GOOGLE_ADSENSE_CLIENT_ID (ca-pub-…). GOOGLE_ADSENSE_SLOT_DASHBOARD, SLOT_HERO, SLOT_RECENT, SLOT_CITY_DETAIL, SLOT_DEFAULT — display unit IDs. AdSense Management API OAuth: GOOGLE_ADSENSE_OAUTH_CLIENT_ID, GOOGLE_ADSENSE_OAUTH_CLIENT_SECRET, optional GOOGLE_ADSENSE_OAUTH_REDIRECT_URI (defaults to ${NEXT_PUBLIC_APP_URL}/api/admin/adsense/oauth/callback). Keep client ID in host secrets only. /ads.txt generated at runtime from client ID.',
    },
    {
      id: 'env-analytics',
      title: 'Analytics environment',
      body:
        'NEXT_PUBLIC_GA_MEASUREMENT_ID — optional GA4 loader when consent.analytics is on. NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION — Search Console meta tag.',
    },
    {
      id: 'scripts',
      title: 'npm scripts',
      body:
        'dev, build, start — Next.js. lint, test, test:watch, verify — quality gate (verify = lint + test + build). copy:icons — Meteocons to public (also postinstall). seed:checks — North England demo snapshots. backfill:city-slugs — populate city_slug on existing locations. email — React Email preview server. audit:deps — npm audit --omit=dev.',
    },
    {
      id: 'sqlite',
      title: 'SQLite tables',
      body:
        'Core weather: weather_snapshots, api_call_log. Locations and checks: locations, location_weather_checks, weather_observations, weather_forecast_archive. Subscriptions: subscriptions, subscription_send_log. Platform: platform_settings (singleton). Heroes: hero_image_cache. Monetization: adsense_report_snapshots. Analytics: site_analytics_events. Email/CMS: email_templates, cms_pages. Admin: admin_users, admin_invites, admin_password_resets, admin_audit_log. Schema in src/lib/db/index.js. First open seeds platform_settings with refresh 1h, stale 2h, daily limit 1000, soft block 950, warning 800, per-minute 60.',
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
        'From storage-keys.js: meridian:client-id, meridian:saved-cities, meridian:checked-cities, meridian:user-location, meridian:weather-cache, meridian:theme, meridian:cookie-consent, meridian:subscriptions, meridian:tier (reserved), meridian:consent, meridian:accessibility, meridian:city-detail-accordion, meridian:temperature-unit, meridian:preferred-locale, meridian:weather-refresh-mode. sessionStorage meridian_analytics_sid — first-party analytics session id. Admin cookie meridian_admin_session (HttpOnly, server-set). Custom event meridian:storage syncs hooks after writes.',
    },
  ],
};
