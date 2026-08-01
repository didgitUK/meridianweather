export const dashboardDoc = {
  slug: 'dashboard',
  title: 'Dashboard',
  lastUpdated: '2026-08-01',
  sections: [
    {
      id: 'layout',
      title: 'What you see on the home page',
      body:
        'Top to bottom:\n\n1. Hero — satellite map (when your location resolves) with weather overlays, welcome text, search, a quick location weather check, and a 24-hour daylight & conditions scrub. Cloud and rain positions are current; the scrub changes intensity and day/night.\n2. Your locations — weather cards for the places you pinned.\n3. Nearby & popular — two columns: Near you and Popular searches.\n4. A dashboard ad placeholder (or live AdSense when advertising is configured and consented).\n5. Journal — a short article carousel.',
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
        'By default Your locations prefer the last reading saved on this device. Tap refresh on a card for a fresh check (new cities without a saved reading also fetch automatically).',
    },
    {
      id: 'recent-checks',
      title: 'Near you and Popular searches',
      body:
        'Near you — places around your home or region, with current conditions. These are not “your past searches.”\n\nPopular searches — places many people on this site have searched, up to five cards. On a quiet or brand-new install you may see a few demo cities until real search activity builds up.\n\nCards link to the city page when we have coordinates. See Nearby & popular for more detail.',
    },
  ],
};
