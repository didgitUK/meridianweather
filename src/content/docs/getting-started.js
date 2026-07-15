export const gettingStartedDoc = {
  slug: 'getting-started',
  title: 'Getting started',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      body:
        'meridian is a multi-city weather dashboard. You search for locations, pin up to ten cities in your browser, and monitor current conditions, short forecasts, and optional email updates. No account is required — all city lists and preferences are stored per device in localStorage.',
    },
    {
      id: 'requirements',
      title: 'Requirements',
      body:
        'The dashboard needs a server-side OpenWeather API key (OPENWEATHER_API_KEY). Without it, weather and geocode requests return errors. Email subscriptions, cron jobs, and AdSense are optional and activate only when their environment variables / connectors are configured. SQLite (better-sqlite3) always runs for cache and quota.',
    },
    {
      id: 'add-city',
      title: 'Pinning a city',
      body:
        'Use the search field on the home page hero or in the header. Type at least two characters; results appear after a 300ms debounce. Select a geocode result to open the city detail page. Use Pin to your locations on that page to save the city to Your locations. Duplicates are rejected. Each city receives a stable ID: {slugified-name}-{country}-{latitude to four decimals}, used in URLs like /city/london-gb-51.5073.',
    },
    {
      id: 'city-limit',
      title: 'City limit',
      body:
        'You may pin up to ten cities (MAX_SAVED_CITIES). When the limit is reached, pin another city only after removing one from your grid.',
    },
    {
      id: 'first-visit',
      title: 'First visit: cookies and theme',
      body:
        'On first visit a cookie banner explains local storage use. Buttons: Accept all (functional + advertising), Accept functional, Essential only, and Manage preferences. Reopen cookie settings anytime via the floating Settings control (Cookies tab). The floating theme toggle switches light or dark preference (stored in meridian:theme).',
    },
    {
      id: 'navigation',
      title: 'Where to go next',
      body:
        'Dashboard explains the home page layout. City detail covers full forecast pages. Forecasts & cache explains TTLs and caching layers. Subscriptions covers email. API limits and API reference document server behaviour. Documentation is also served at docs.localhost:3000 when using local dev (middleware rewrite). CMS-edited docs may diverge until reset to file defaults.',
    },
    {
      id: 'verify',
      title: 'For developers',
      body:
        'Run npm run verify to lint, test, and build. Run npm run dev and open localhost:3000. Optional: sign in at /login then open /admin for usage diagnostics and platform settings (dev bypass may apply when ADMIN_SECRET is unset in development).',
    },
  ],
};
