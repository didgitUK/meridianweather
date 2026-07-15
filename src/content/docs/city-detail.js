export const cityDetailDoc = {
  slug: 'city-detail',
  title: 'City detail',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'access',
      title: 'Opening a city page',
      body:
        'Search results and home cards open a page for that place. You do not need to pin a city to view it. Pinning only adds it to Your locations on the home page. A few showcase cities and places already known to the site always open; unknown addresses show a helpful empty state or 404.',
    },
    {
      id: 'tabs',
      title: 'Forecast tabs',
      body:
        'Use the tabs to move between:\n\n• Today — current conditions and quick facts\n• Hourly — the next hours\n• 10-Day — the longer outlook\n• History — past days when we have stored them\n\nYou can share a link that opens a tab (for example with ?tab=hourly). Up to three weather alert banners may appear above the page when alerts exist. An ad unit may sit under the tabs.',
    },
    {
      id: 'header',
      title: 'Map or photo at the top',
      body:
        'By default the header shows a satellite map of the area. Operators can switch to location photos instead (from photo providers when available, otherwise a simple brand image). Optional Street View is an operator setting when the map backdrop is off.',
    },
    {
      id: 'today',
      title: 'Today',
      body:
        'Current temperature and condition, metric tiles (humidity, wind, and similar), and expanders for more detail. A short hourly preview for the rest of the day when available.',
    },
    {
      id: 'hourly',
      title: 'Hourly',
      body:
        'The next twelve hours: temperature, chance of rain, and wind at a glance.',
    },
    {
      id: 'daily',
      title: '10-Day',
      body:
        'Up to ten days with high/low, conditions, rain chance, wind, and UV. Select a day to focus the chart.',
    },
    {
      id: 'history',
      title: 'History',
      body:
        'Past days from stored observations when available, with a day picker and chart.',
    },
    {
      id: 'subscribe',
      title: 'Pin and email',
      body:
        'The Options menu lets you Pin to your locations or Subscribe for a weekly digest and weather alerts for this place.',
    },
    {
      id: 'operators',
      title: 'For site operators',
      body:
        'resolveCity() always serves five PLATFORM_SHOWCASE_CITIES (London, Dubai, New York, Tokyo, Sydney) plus rows with city_slug. Default hero: OSM when isCityHeroOsmEnabled() (NEXT_PUBLIC_CITY_HERO_OSM unset or not "0"); photos when OSM off (Unsplash → Wikimedia → Pexels). Street View opt-in: NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1 with Maps key. Client batch: current, hourly, daily only — no minutely UI. History: GET /api/weather/history. First successful current check can mark the city indexable for sitemap/SEO.',
    },
  ],
};
