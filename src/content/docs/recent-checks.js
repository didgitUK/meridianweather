export const recentChecksDoc = {
  slug: 'recent-checks',
  title: 'Recent checks & seeding',
  lastUpdated: '2026-07-09',
  sections: [
    {
      id: 'purpose',
      title: 'What recent checks are',
      body:
        'Recent checks show what meridian has looked up across the platform — aggregated from server-side weather_snapshots (current scope), not your personal search history. They demonstrate live conditions for locations the platform has recently fetched.',
    },
    {
      id: 'api',
      title: 'API behaviour',
      body:
        'GET /api/recent-checks returns up to forty deduplicated coordinate lookups ordered by fetched_at descending. Each check includes lat, lon, temperature, description, condition, icon code, city name and country when stored in payload, fetchedAt, and source. Response field source is platform when DB rows exist, or showcase when falling back.',
    },
    {
      id: 'showcase-fallback',
      title: 'Showcase fallback',
      body:
        'When SQLite has no current snapshots, the API hydrates four PLATFORM_SHOWCASE_CITIES: London (GB), Dubai (AE), New York (US), Tokyo (JP) by calling the weather orchestrator. This ensures the strip is never empty on a fresh install.',
    },
    {
      id: 'seed-script',
      title: 'Seeding demo data',
      body:
        'Run npm run seed:checks with OPENWEATHER_API_KEY set. The script fetches current weather for forty-three locations across Cumbria and the North East of England (see src/constants/seed-locations.js), writes SQLite snapshots with staggered fetched_at timestamps (four minutes apart), and enriches payloads with city names. Takes about one minute with rate-limit delays.',
    },
    {
      id: 'persistence',
      title: 'Persistence',
      body:
        'Seeded data lives in DATABASE_PATH (default ./data/meridian.db). Re-running the script upserts by cache_key so coordinates update in place. Clearing the database or deleting data/meridian.db resets to showcase fallback.',
    },
    {
      id: 'ui',
      title: 'UI notes',
      body:
        'Recent check cards use Meteocons icons, temperature, description, city label, and “Checked X ago”. They do not link to city detail (those cities may not be on your device). A recent-checks ad placement sits below the strip when AdSense and consent allow.',
    },
  ],
};
