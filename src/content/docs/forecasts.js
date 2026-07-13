export const forecastsDoc = {
  slug: 'forecasts',
  title: 'Forecasts & cache',
  lastUpdated: '2026-07-09',
  sections: [
    {
      id: 'scopes',
      title: 'Weather scopes',
      body:
        'Client-requestable scopes: current (now), hourly (timeline), daily (timeline), minutely (precipitation). Server-only scopes: geocode (city search cache keyed geocode:{query}), alert (individual alert payloads). Each scope has its own cache key {lat},{lon},{scope} except geocode.',
    },
    {
      id: 'layers',
      title: 'Cache layers',
      body:
        'L0 — browser localStorage meridian:weather-cache, structure {cityId: {scope: {payload, fetchedAt}}}. L1 — in-memory Map on the server process. L2 — SQLite weather_snapshots with fetched_at, expires_at, stale_until. Reads check L0 → API → L1/L2 → upstream OpenWeather.',
    },
    {
      id: 'freshness',
      title: 'Freshness states',
      body:
        'fresh — within expires_at. acceptable — past expires but within stale_until (may still serve). expired — beyond stale_until, triggers upstream if quota allows. emergency — quota blocked but expired/acceptable L2 snapshot served anyway so users still see data.',
    },
    {
      id: 'ttl-table',
      title: 'TTL defaults (SCOPE_TTL)',
      body:
        'current — fresh 1h, stale 2h (overridden by platform_settings.refresh_interval_ms and stale_cache_max_ms; admin can set 10m–2h). hourly — fresh 2h, stale 6h. daily — fresh 6h, stale 12h. minutely — fresh 15m, stale 30m. geocode — fresh 7d, stale 30d. alert — fresh 1h, stale 6h.',
    },
    {
      id: 'upstream',
      title: 'OpenWeather integration',
      body:
        'Primary: One Call API 4.0 (onecall/current, timeline/1h, timeline/1day, timeline/1min). Current scope falls back to API 2.5 /weather if One Call current fails. Geocode uses OpenWeather geocoding API. Normalisation in src/lib/one-call.js produces consistent UI payloads.',
    },
    {
      id: 'batch',
      title: 'Batch fetching',
      body:
        'POST /api/weather/batch accepts {cities: [{lat, lon}], scopes: []}. Dashboard loads current for all cities, then idle-loads daily per card. City detail batches current+hourly+daily+minutely. Batch handler spaces requests ~100ms apart to avoid burst rate limits.',
    },
    {
      id: 'headers',
      title: 'Response metadata',
      body:
        'API responses include meta: cacheLayer (memory, database, upstream), freshness, fetchedAt, ageMs, upstreamCallAvoided, source. X-Cache header reflects hit/miss where applicable. “Updated X ago” in UI uses meta.fetchedAt.',
    },
    {
      id: 'quota',
      title: 'Quota interaction',
      body:
        'When daily or per-minute limits are exceeded, upstream calls stop and emergency stale L2 data is returned if available. Forecast scopes load lazily on cards to reduce quota use. Reopening a city within TTL costs zero upstream calls.',
    },
    {
      id: 'payload-fields',
      title: 'Current payload fields',
      body:
        'temperature, feelsLike, description, condition, icon (OpenWeather code), humidity, pressure, dewPoint, uvi, clouds, visibility, windSpeedKmh, windGustKmh, windDeg, sunrise, sunset, alertIds, city, country, timezone, updatedAt, source.',
    },
  ],
};
