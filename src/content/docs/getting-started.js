export const gettingStartedDoc = {
  slug: 'getting-started',
  title: 'Getting started',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'overview',
      title: 'What meridian is',
      body:
        'meridian is a weather dashboard for several places at once. Search for a city, open its page, pin it to Your locations, and keep an eye on temperature, conditions, and short forecasts. You do not need an account. Your pinned cities and most preferences stay on this device.',
    },
    {
      id: 'add-city',
      title: 'How to pin a city',
      body:
        '1. Type at least two characters in the search field on the home page or in the header. Results appear after a short pause.\n2. Choose a place from the list — that opens the city page.\n3. Tap Pin to your locations to save it. You can unpin later from the same menu or remove the city from the home grid.\n\nPinned places appear under Your locations on the home page. You can pin up to ten. City page addresses look like /city/london-GB-51.5073.',
    },
    {
      id: 'city-limit',
      title: 'Ten-city limit',
      body:
        'Your locations can hold up to ten pinned cities. If you are at the limit, remove one before pinning another.',
    },
    {
      id: 'first-visit',
      title: 'Cookies, ads, and theme',
      body:
        'On a first visit a banner asks how you want storage and advertising to work:\n\n• Accept all — useful site features plus advertising\n• Accept functional — useful features without advertising\n• Essential only — the basics needed for the site to work\n• Manage preferences — pick categories yourself\n\n“Accept all” does not turn on Google Analytics or our optional usage analytics — switch Analytics on separately under preferences if offered.\n\nYou can reopen Cookie preferences from the floating Settings control (gear). That control may hide while you scroll down, and may be hidden when your device asks for reduced motion. Theme (light / dark) has its own floating control.',
    },
    {
      id: 'navigation',
      title: 'Where to go next',
      body:
        'Dashboard explains the home page. City detail covers forecast tabs. Subscriptions covers email digests and alerts. Monetization & consent explains ads and privacy choices. Later pages (Forecasts & cache, API reference, Deployment) are mainly for people who run the site.',
    },
    {
      id: 'operators',
      title: 'For site operators',
      body:
        'Live weather needs OPENWEATHER_API_KEY on the server. Email, cron jobs, and AdSense are optional. SQLite (better-sqlite3) stores shared cache and usage limits. Run npm run verify to lint, test, and build. Admin: sign in at /login then open /admin. Dev bypass only when NODE_ENV=development, ALLOW_DEV_ADMIN_BYPASS=1, and ADMIN_SECRET is unset. CMS-edited docs may differ until reset to file defaults. Local docs subdomain: docs.localhost:3000.',
    },
  ],
};
