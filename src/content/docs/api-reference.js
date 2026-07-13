export const apiReferenceDoc = {
  slug: 'api-reference',
  title: 'API reference',
  lastUpdated: '2026-07-09',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      body:
        'All API routes are Next.js App Router handlers under src/app/api/. Weather and geocode require OPENWEATHER_API_KEY. Cron routes require Authorization: Bearer CRON_SECRET. Admin routes use x-admin-secret when ADMIN_SECRET is set.',
    },
    {
      id: 'weather',
      title: 'GET /api/weather',
      body:
        'Query: lat, lon, scope (current|hourly|daily|minutely). Returns {data, meta}. Errors: 400 invalid params, 404 location not found, 429/502 quota or upstream failures.',
    },
    {
      id: 'weather-batch',
      title: 'POST /api/weather/batch',
      body:
        'Body: { cities: [{lat, lon, id?}], scopes: string[] }. Returns array of {cityId?, lat, lon, scopes: {scope: {data, meta}}}. Used by dashboard and city detail hooks.',
    },
    {
      id: 'geocode',
      title: 'GET /api/geocode',
      body:
        'Query: q (min 2 chars). Returns normalised array: name, country, state, lat, lon, label. Max 5 results. Cached in L2 with geocode scope.',
    },
    {
      id: 'recent-checks',
      title: 'GET /api/recent-checks',
      body:
        'No params. Returns {checks: [], source: platform|showcase}. Up to 40 deduplicated current snapshots.',
    },
    {
      id: 'subscriptions',
      title: '/api/subscriptions',
      body:
        'GET ?clientId= — list active subscriptions for client. POST — create {clientId, email, type, cityName?, cityLat?, cityLon?, frequency?, alertOnRain?, alertOnStorm?}. DELETE — body {clientId, cityLat, cityLon, types[]}.',
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
        'GET /api/cron/weekly-digests — send weekly emails. GET /api/cron/weather-alerts — evaluate and send alert emails. Both require Bearer CRON_SECRET.',
    },
    {
      id: 'admin',
      title: 'Admin routes',
      body:
        'GET /api/admin/usage — usage stats. PATCH /api/admin/settings — {refreshIntervalMs}. Header x-admin-secret when ADMIN_SECRET configured.',
    },
    {
      id: 'ads',
      title: 'Ads routes',
      body:
        'GET /api/ads/config — {scriptEnabled, clientId, consentRequired}. GET /api/ads?placement=dashboard|hero|recent-checks — placement config with slotId when set. App route GET /ads.txt — AdSense publisher line from env.',
    },
    {
      id: 'errors',
      title: 'Error shape',
      body:
        'JSON errors typically {error: code, message: string}. ApiError codes include invalid_request, service_unavailable, location_not_found, rate_limited, upstream_error.',
    },
  ],
};
