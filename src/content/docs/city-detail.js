export const cityDetailDoc = {
  slug: 'city-detail',
  title: 'City detail',
  lastUpdated: '2026-08-01',
  sections: [
    {
      id: 'access',
      title: 'Opening a city page',
      body:
        'Search results and home cards open a page for that place. You do not need to pin a city to view it. Pinning only adds it to Your locations on the home page. Showcase cities and places already known to the site always open; unknown addresses show a helpful empty state or 404. Many UK places use a canonical `/weather/{slug}` URL.',
    },
    {
      id: 'tabs',
      title: 'Forecast tabs',
      body:
        'Use the tabs to move between:\n\n• Today — current conditions and quick facts\n• Hourly — the next hours\n• 10-Day — the longer outlook\n• History — past days when we have stored them\n\nYou can share a link that opens a tab (for example with ?tab=hourly). Weather alert banners may appear above the page when alerts exist. An ad unit may sit under the tabs when advertising is consented and configured.',
    },
    {
      id: 'header',
      title: 'Map or photo at the top',
      body:
        'By default the header shows a satellite map of the area. Some hosts show location photos instead when available, otherwise a simple brand image. An optional Street View control may appear depending on host configuration.',
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
        'A densified short-range hourly strip (typically the next twelve hours): temperature, chance of rain, and wind at a glance. Open the wider hourly view when you need a longer window.',
    },
    {
      id: 'daily',
      title: '10-Day',
      body:
        'Up to ten days with high/low, conditions, rain chance, wind, and UV. Select a day to focus the chart. Confidence fades further out — treat far days as a direction of travel.',
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
  ],
};
