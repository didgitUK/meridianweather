export const gettingStartedDoc = {
  slug: 'getting-started',
  title: 'Getting started',
  lastUpdated: '2026-07-09',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      body:
        'meridian is a multi-city weather dashboard. You search for locations, save up to ten cities in your browser, and monitor current conditions, short forecasts, and optional email updates. No account is required — all city lists and preferences are stored per device in localStorage.',
    },
    {
      id: 'requirements',
      title: 'Requirements',
      body:
        'The dashboard needs a server-side OpenWeather API key (OPENWEATHER_API_KEY). Without it, weather and geocode requests return errors. Email subscriptions, cron jobs, and AdSense are optional and activate only when their environment variables are configured.',
    },
    {
      id: 'add-city',
      title: 'Adding a city',
      body:
        'Use the search field on the home page hero or the compact search on cards. Type at least two characters; results appear after a 300ms debounce. Select a geocode result to add the city. Duplicates are rejected. Each city receives a stable ID: {slugified-name}-{country}-{latitude to four decimals}, used in URLs like /city/london-gb-51.5073.',
    },
    {
      id: 'city-limit',
      title: 'City limit',
      body:
        'You may save up to ten cities (MAX_SAVED_CITIES). When the limit is reached, add another city only after removing one from your grid.',
    },
    {
      id: 'first-visit',
      title: 'First visit: cookies and theme',
      body:
        'On first visit a cookie banner explains local storage use. Accept enables functional storage; Accept all also enables advertising consent for Google AdSense on the free tier. Open Privacy preferences from the footer at any time. The floating controls dock theme toggle switches light or dark preference (stored in meridian:theme).',
    },
    {
      id: 'navigation',
      title: 'Where to go next',
      body:
        'Dashboard explains the home page layout. City detail covers full forecast pages. Forecasts & cache explains TTLs and caching layers. Subscriptions covers email. API limits and API reference document server behaviour. Documentation is also served at docs.localhost:3000 when using local dev (middleware rewrite).',
    },
    {
      id: 'verify',
      title: 'For developers',
      body:
        'Run npm run verify to lint, test, and build. Run npm run dev and open localhost:3000. Optional: open /admin for usage diagnostics and platform settings.',
    },
  ],
};
