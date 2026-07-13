export const cityDetailDoc = {
  slug: 'city-detail',
  title: 'City detail',
  lastUpdated: '2026-07-09',
  sections: [
    {
      id: 'access',
      title: 'Who can view a city page',
      body:
        'City detail pages at /city/[cityId] are public once meridian has recorded a successful weather check for that location. Featured cities and any recently checked city with a stable slug are available without saving the city on your device. If you open a malformed or unknown slug, you receive a 404 page.',
    },
    {
      id: 'hero',
      title: 'Current conditions hero',
      body:
        'Large temperature, Meteocons icon, description, and “Updated X ago” from the current scope. Data loads via POST /api/weather/batch with scopes current, hourly, daily, and minutely in one request bundle.',
    },
    {
      id: 'alerts',
      title: 'Weather alerts',
      body:
        'When OpenWeather returns alerts, up to three appear in a banner with event name and sender. Full alert text is available via GET /api/alerts/[alertId].',
    },
    {
      id: 'minutely',
      title: 'Next-hour precipitation (Premium gate)',
      body:
        'The minutely scope strip shows precipitation for the next hour. On the free tier this section is behind PremiumGate with a disabled upgrade button (Stripe checkout planned). Premium tier (dev toggle via Ctrl+Shift+L) unlocks the strip immediately.',
    },
    {
      id: 'hourly',
      title: 'Hourly forecast',
      body:
        'Horizontal scroll of the next twelve hourly points: time label, icon, temperature, and probability of precipitation when available. The section heading reads “Next 48 hours” but the UI currently renders twelve hours from the hourly scope payload.',
    },
    {
      id: 'daily',
      title: 'Daily outlook',
      body:
        'Full daily scope list (up to ten days from OpenWeather): weekday, icon, description, min/max range, and precipitation probability. This is not premium-gated in the current build despite extendedDaily appearing in premium marketing copy.',
    },
    {
      id: 'subscribe',
      title: 'Subscribe on detail page',
      body:
        'The same SubscribeModal as dashboard cards allows weekly digest and rain/storm alert emails. Badge states reflect active subscriptions synced from the server by anonymous clientId.',
    },
    {
      id: 'prefetch',
      title: 'Prefetch',
      body:
        'Hovering a dashboard card prefetches /city/[cityId] and warms L0 cache via useCityWeather so detail pages open faster.',
    },
    {
      id: 'seo',
      title: 'Search and discovery',
      body:
        'When a city receives its first successful current-weather check, meridian marks it indexable, adds it to the sitemap, and server-renders SEO metadata plus a summary block on the city page.',
    },
  ],
};
