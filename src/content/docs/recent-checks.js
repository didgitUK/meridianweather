export const recentChecksDoc = {
  slug: 'recent-checks',
  title: 'Recent checks & seeding',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'purpose',
      title: 'What recent checks are',
      body:
        'Recent checks on the home page show platform-wide popular searches — locations ranked by how often users selected or previewed them via search — not your personal search history and not a raw dump of the weather snapshot cache.',
    },
    {
      id: 'api',
      title: 'API behaviour',
      body:
        'GET /api/recent-checks calls getRecentChecksPayload(), which reads location_weather_checks (joined to locations) via listPopularSearchChecks. Default limit is 20. Triggers counted are search_select and search_preview. Response shape is { checks, source } where source is popular when rows exist, or empty when none. There is no showcase fallback.',
    },
    {
      id: 'ui',
      title: 'Home UI',
      body:
        'RecentChecksSection shows two columns (“Near you” and “Popular searches”), up to five cards each. Cards use Meteocons icons, temperature, description, and city label. When coordinates exist, cards link to /city/[cityId]. There is no recent-checks AdSlot on the home page.',
    },
    {
      id: 'seed-script',
      title: 'Seeding weather snapshots (not the strip)',
      body:
        'Run npm run seed:checks with OPENWEATHER_API_KEY set. The script fetches current weather for forty-three locations across Cumbria and the North East of England (see src/constants/seed-locations.js), writes SQLite weather_snapshots with staggered fetched_at timestamps, and enriches payloads with city names. That populates the L2 cache for demos — it does not insert search-triggered location_weather_checks rows, so it will not fill the recent-checks / popular searches strip.',
    },
    {
      id: 'persistence',
      title: 'Persistence',
      body:
        'Seeded snapshots live in DATABASE_PATH (default ./data/meridian.db). Re-running the script upserts by cache_key. Popular-search rows accumulate as real searches are recorded; clearing the database empties both snapshots and check history (the strip shows empty until new searches occur).',
    },
  ],
};
