export const recentChecksDoc = {
  slug: 'recent-checks',
  title: 'Nearby & popular',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'purpose',
      title: 'The two home columns',
      body:
        'Under Your locations the home page shows two short lists of places.\n\nNear you — suggested places near your home or region, with live conditions. This is not a private log of everything you searched.\n\nPopular searches — places that are searched often on this site. Again, this is site-wide, not “your personal history.”',
    },
    {
      id: 'ui',
      title: 'How the cards behave',
      body:
        'Each column shows up to five cards with icon, temperature, description, and place name. Tap a card to open the city page when coordinates are available.',
    },
    {
      id: 'demo-empty',
      title: 'When Popular searches looks busy on a new install',
      body:
        'If almost nobody has searched yet, the site may show a few well-known demo cities in Popular searches so the column is not empty. Operators can turn that demo list off. Near you still depends on location signals and nearby place data.',
    },
    {
      id: 'operators',
      title: 'For site operators',
      body:
        'Popular searches data: GET /api/recent-checks → getRecentChecksPayload() → listPopularSearchChecks on location_weather_checks (triggers search_select / search_preview), default limit 20, source popular|empty. The API itself does not showcase-hydrate.\n\nUI demo fallback: when the API returns empty and SHOW_DEMO_POPULAR_SEARCHES is true (default; disable with NEXT_PUBLIC_SHOW_DEMO_POPULAR_SEARCHES=0), Popular searches fills from PLATFORM_SHOWCASE_CITIES.\n\nNear you: nearby places from the home location profile + current weather batch — not the recent-checks API.\n\nnpm run seed:checks writes North England weather_snapshots for L2 cache demos; it does not insert search-triggered check rows and will not fill Popular searches by itself.',
    },
  ],
};
