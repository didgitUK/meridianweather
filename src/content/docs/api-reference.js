export const apiReferenceDoc = {
  slug: 'api-reference',
  title: 'API reference',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      body:
        'All API routes are Next.js App Router handlers under src/app/api/. Weather and geocode require OPENWEATHER_API_KEY. Cron routes require Authorization: Bearer CRON_SECRET. Admin routes require an authenticated admin session cookie (meridian_admin_session) after login at /login, unless dev bypass applies.',
    },
    {
      id: 'weather',
      title: 'GET /api/weather',
      body:
        'Query: lat, lon, scope (current|hourly|daily|minutely), optional trigger, lang. Returns weather payload plus fetchedAt, cacheHit, freshness, source, trigger, tokensUsed. X-Cache header reflects cache layer. Errors: 400 invalid params, 404 location not found, 429 rate_limited, 502 upstream_error or service_unavailable.',
    },
    {
      id: 'weather-batch',
      title: 'POST /api/weather/batch',
      body:
        'Body: { cities: [{ lat, lon, scopes?: string[], id?, lang?, maxAgeMs?, trigger? }], trigger?, lang? }. Returns { cities: [{ lat, lon, scopes: { scope: { data, meta } | { error } } }] }. Scopes are per-city, not a top-level array. Rate-limited to 20 requests/minute per IP. Used by dashboard and city detail hooks.',
    },
    {
      id: 'weather-history',
      title: 'GET /api/weather/history',
      body:
        'Query: lat, lon, optional from, to (ISO dates), limit. Returns { summary, observations, forecasts: { hourly, daily } } from weather_observations and weather_forecast_archive tables.',
    },
    {
      id: 'geocode',
      title: 'GET /api/geocode',
      body:
        'Query: q (min 2 chars), optional context params. Returns normalised array: name, country, state, lat, lon, label. Upstream limit 5 results. Cached in L2 with geocode scope. Rate-limited to 60 requests/minute per IP.',
    },
    {
      id: 'recent-checks',
      title: 'GET /api/recent-checks',
      body:
        'No params. Returns { checks, source } where source is popular when search-triggered rows exist, or empty when none. Default limit 20 from location_weather_checks ranked by search volume (search_select and search_preview triggers). No showcase fallback.',
    },
    {
      id: 'subscriptions',
      title: '/api/subscriptions',
      body:
        'GET ?clientId= — list active subscriptions for client. POST — create { clientId, email, type, cityName?, cityLat?, cityLon?, frequency?, alertOnRain?, alertOnStorm?, alertPrefs? }. PATCH — update alertPrefs on a city_alerts row { clientId, id, alertPrefs }. DELETE — body { clientId, cityLat, cityLon, types[] }. Types: newsletter, city_weekly, city_alerts.',
    },
    {
      id: 'unsubscribe',
      title: 'GET /api/unsubscribe',
      body:
        'Query: token (unsubscribe_token UUID). Deactivates subscription and returns HTML confirmation.',
    },
    {
      id: 'alerts',
      title: 'GET /api/alerts/[alertId]',
      body:
        'Returns normalised alert: id, senderName, event, start, end, description. Sourced from cached alert scope.',
    },
    {
      id: 'cron',
      title: 'Cron routes',
      body:
        'GET /api/cron/weekly-digests — send weekly digest emails grouped by subscriber email. GET /api/cron/weather-alerts — evaluate alertPrefs against OpenWeather, Open-Meteo, and NWS feeds and send alert emails. Both require Bearer CRON_SECRET.',
    },
    {
      id: 'admin',
      title: 'Admin routes',
      body:
        'Usage and config: GET /api/admin/usage; GET|PATCH /api/admin/config; legacy PATCH /api/admin/settings { refreshIntervalMs }. Users and auth: GET|POST /api/admin/users; POST /api/admin/users/invite; GET /api/admin/me. Data: GET /api/admin/checks; GET /api/admin/locations; GET|PATCH /api/admin/subscriptions; GET /api/admin/mailing-summary; GET /api/admin/analytics. Connectors: GET|PATCH /api/admin/connections; GET|PATCH /api/admin/openweather-key; GET|PATCH /api/admin/email-key. Email CMS: GET|POST|PATCH /api/admin/email-templates; POST /api/admin/email/test, /compose, /sync. AdSense: GET /api/admin/adsense/report; POST /api/admin/adsense/sync; OAuth GET /api/admin/adsense/oauth/start, /callback, /disconnect. CMS: GET|PATCH /api/admin/cms-pages. All require meridian_admin_session unless dev bypass.',
    },
    {
      id: 'ads',
      title: 'Ads routes',
      body:
        'GET /api/ads/config — { scriptEnabled, clientId, consentRequired }. GET /api/ads?placement=dashboard|hero|recent-checks|city-detail — placement config with slotId when set. GET /api/ads/placeholder-bg — hero lookup for placeholder surfaces. App route GET /ads.txt — AdSense publisher line from env. Active AdSlot placements: dashboard, hero, city-detail. recent-checks slot env exists but home has no AdSlot.',
    },
    {
      id: 'other',
      title: 'Other public routes',
      body:
        'GET /api/platform/limits — public quota snapshot. POST /api/analytics/collect — first-party analytics beacon. GET /api/location/region — IP/region helper. POST /api/weather/inaccurate-report — flag bad data. GET /api/weather/map-tile/[layer]/[z]/[x]/[y] — OSM hero overlay tiles. Auth: POST /api/auth/login, /logout; POST /api/auth/forgot-password; POST /api/auth/reset-password/[token]; GET|POST /api/auth/invite/[token]; GET /api/auth/session.',
    },
    {
      id: 'errors',
      title: 'Error shape',
      body:
        'JSON errors typically { error: code, message: string }. ApiError codes include invalid_request, service_unavailable, location_not_found, rate_limited, upstream_error, unauthorized, not_found, limit_reached.',
    },
  ],
};
