export const cookiesPolicy = {
  slug: 'cookies',
  title: 'Cookie Policy',
  lastUpdated: '2026-07-09',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      body:
        'meridian v1 does not use first-party tracking cookies. We use browser localStorage for essential and optional features. When you enable advertising consent and AdSense is configured, Google may set third-party cookies as part of ad delivery.',
    },
    {
      id: 'local-storage',
      title: 'localStorage keys',
      body:
        'meridian:saved-cities — your city list. meridian:client-id — anonymous UUID for subscriptions. meridian:weather-cache — L0 weather payloads by city and scope. meridian:theme — light/dark/system. meridian:subscriptions — local mirror of email prefs. meridian:consent — JSON consent categories. meridian:tier — free or premium. meridian:cookie-consent — legacy accept flag.',
    },
    {
      id: 'consent-json',
      title: 'Consent categories (meridian:consent)',
      body:
        'essential — always on (cities, client ID, theme). functional — weather cache preference (stored; cache writes are not strictly gated in v1). marketing — reserved. analytics — coming soon, not used. advertising — controls Google AdSense script load on free tier.',
    },
    {
      id: 'advertising',
      title: 'Advertising',
      body:
        'When advertising is enabled in Privacy preferences, the free tier may load Google AdSense from pagead2.googlesyndication.com. Publisher ID is configured server-side only. Withdraw consent anytime via footer Privacy preferences.',
    },
    {
      id: 'clearing',
      title: 'How to withdraw consent',
      body:
        'Footer → Privacy preferences. Or clear site data in browser settings. Disabling advertising stops the AdSense script on next page load.',
    },
  ],
};
