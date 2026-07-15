export const dashboardDoc = {
  slug: 'dashboard',
  title: 'Dashboard',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'layout',
      title: 'What you see on the home page',
      body:
        'Top to bottom:\n\n1. Hero — welcome text, search, and a quick location weather check.\n2. Your locations — weather cards for the places you pinned.\n3. Nearby & popular — two columns: Near you and Popular searches.\n4. A dashboard ad placeholder (or live AdSense when configured).\n5. Journal — a short article carousel.\n\nOperators can hide the ad and Journal with NEXT_PUBLIC_SHOW_HOME_STRETCH=0 for a leaner home page.',
    },
    {
      id: 'cards',
      title: 'Your location cards',
      body:
        'Each card shows the place name, temperature, condition, weather icon, feels-like, humidity, and wind. Tap a card to open the full city page. While weather loads you see a placeholder; if a fetch fails you get Retry and Remove.',
    },
    {
      id: 'forecast-strip',
      title: 'Seven-day strip',
      body:
        'Under the main reading, each card shows a seven-day outlook (day name, icon, high and low). Current conditions and that outlook load together so you are not waiting on a second step.',
    },
    {
      id: 'card-actions',
      title: 'Subscribe and remove',
      body:
        'Subscribe opens email options for a weekly digest and weather alerts for that city. Remove takes the city off Your locations and clears its saved weather on this device. If you still have email alerts for that city, you will be asked whether to cancel them too.',
    },
    {
      id: 'states',
      title: 'Empty dashboard',
      body:
        'With no pinned cities, the grid explains how to search and pin your first place from the city page.',
    },
    {
      id: 'refresh',
      title: 'When readings update',
      body:
        'By default Your locations prefer the last reading saved on this device. Tap refresh on a card for a fresh check (new cities without a saved reading also fetch automatically). There is no Settings → Weather switch in the current UI.',
    },
    {
      id: 'recent-checks',
      title: 'Near you and Popular searches',
      body:
        'Near you — places around your home or region, with current conditions. These are not “your past searches.”\n\nPopular searches — places many people on this site have searched, up to five cards. On a quiet or brand-new install you may see a few demo cities until real search activity builds up.\n\nCards link to the city page when we have coordinates. See Nearby & popular for more detail.',
    },
    {
      id: 'operators',
      title: 'For site operators',
      body:
        'Home stretch (dashboard AdSlot + Journal): on by default; set NEXT_PUBLIC_SHOW_HOME_STRETCH=0 to hide. Demo popular cities when the API has no rows: SHOW_DEMO_POPULAR_SEARCHES (default on; set NEXT_PUBLIC_SHOW_DEMO_POPULAR_SEARCHES=0 to disable). Popular searches API: GET /api/recent-checks (limit 20, source popular|empty). Near you does not use that API. Seed script npm run seed:checks fills weather_snapshots only — it does not fill Popular searches.',
    },
  ],
};
