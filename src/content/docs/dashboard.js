export const dashboardDoc = {
  slug: 'dashboard',
  title: 'Dashboard',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'layout',
      title: 'Page layout',
      body:
        'The home page bands: (1) Hero — product intro, location weather check, and a square hero ad. (2) Recent checks — two columns (“Near you” and “Popular searches”). (3) Your locations — pinned-city weather cards. (4) Dashboard ad placeholder/unit. (5) Journal — six blog-style article cards in a left/right carousel linking to `/journal/[slug]` posts.',
    },
    {
      id: 'cards',
      title: 'Weather cards',
      body:
        'Each card shows city name, region/country, current temperature, condition description, Meteocons weather icon, feels-like temperature, humidity, and wind. Cards link to the city detail page. Hover prefetches the detail route and weather data.',
    },
    {
      id: 'forecast-strip',
      title: 'Seven-day mini forecast',
      body:
        'Below the main reading, each card shows a seven-day outlook (day label, icon, min/max). Current and daily scopes load together in one dashboard batch request — there is no separate idleCallback daily fetch. The strip shows day label, icon, and min/max temperature range.',
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
        'While weather loads, a skeleton card is shown. On upstream failure, the card displays an error alert with Retry and Remove actions. An empty grid shows guidance to search and pin your first city from the city detail page.',
    },
    {
      id: 'refresh',
      title: 'Refresh behaviour',
      body:
        'By default, Your locations uses manual refresh (`meridian:weather-refresh-mode`): the dashboard serves the last reading stored in this browser on page load, and only fetches when you tap refresh on a card (or when a city has no local cache yet). There is no Settings → Weather panel in the current UI; the key exists for programmatic / future use. Data is also cached server-side (memory + SQLite). See Forecasts & cache for TTL details.',
    },
    {
      id: 'recent-checks',
      title: 'Recent checks',
      body:
        'Two columns show up to five cards each from GET /api/recent-checks (popular searches from location_weather_checks, API limit 20, source popular|empty). Cards link to city detail when coordinates exist. npm run seed:checks fills weather_snapshots only — it does not populate this strip. See Recent checks & seeding.',
    },
  ],
};
