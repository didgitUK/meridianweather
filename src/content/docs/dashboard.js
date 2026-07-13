export const dashboardDoc = {
  slug: 'dashboard',
  title: 'Dashboard',
  lastUpdated: '2026-07-09',
  sections: [
    {
      id: 'layout',
      title: 'Page layout',
      body:
        'The home page has three bands: (1) Hero — product intro and primary city search (variant hero). (2) Recent checks — horizontal strip of platform-wide lookups from server cache (not your personal history). (3) Your locations — responsive grid (1/2/3 columns) of saved-city weather cards. A dashboard ad placement appears below the grid on the free tier when AdSense is configured and advertising consent is enabled.',
    },
    {
      id: 'cards',
      title: 'Weather cards',
      body:
        'Each card shows city name, region/country, current temperature, condition description, Meteocons weather icon, feels-like temperature, humidity, wind speed and direction, and pressure. An “Updated X ago” label reflects cache freshness. Cards link to the city detail page. Hover prefetches the detail route and weather data.',
    },
    {
      id: 'forecast-strip',
      title: 'Five-day mini forecast',
      body:
        'Below the main reading, each card lazy-loads a daily scope forecast (five days) via requestIdleCallback after current weather loads. This avoids blocking the initial paint and protects API quota. The strip shows day label, icon, and min/max temperature range.',
    },
    {
      id: 'card-actions',
      title: 'Card actions',
      body:
        'Subscribe opens a modal for weekly digest and weather alert emails for that city. Remove (X) deletes the city from localStorage and clears its browser weather cache. If you have active email subscriptions for that city, a dialog offers to unsubscribe before removal.',
    },
    {
      id: 'states',
      title: 'Loading and error states',
      body:
        'While weather loads, a skeleton card is shown. On upstream failure, the card displays an error alert with Retry and Remove actions. An empty grid shows guidance to search and add your first city.',
    },
    {
      id: 'refresh',
      title: 'Refresh behaviour',
      body:
        'By default, Your locations uses manual refresh: the dashboard serves the last reading stored in this browser on page load, and only fetches when you tap refresh on a card (or when a city has no local cache yet). In Settings → Weather you can switch to “Refresh when page reloads”, which re-checks all saved locations on each dashboard visit within server TTL. Data is also cached server-side (memory + SQLite). See Forecasts & cache for TTL details.',
    },
    {
      id: 'recent-checks',
      title: 'Recent checks strip',
      body:
        'Shows up to forty deduplicated platform lookups from SQLite weather_snapshots (current scope). If the database is empty, four showcase cities (London, Dubai, New York, Tokyo) are hydrated live. Cards are display-only — they do not add cities to your list. Use npm run seed:checks to populate demo data (see Recent checks & seeding).',
    },
  ],
};
