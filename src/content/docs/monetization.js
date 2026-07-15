export const monetizationDoc = {
  slug: 'monetization',
  title: 'Monetization & consent',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'tiers',
      title: 'Free for everyone today',
      body:
        'meridian runs as a free weather site. There is no working Premium checkout or paid plan that removes ads. Advertising only appears if you allow advertising consent and the operator configured Google AdSense.',
    },
    {
      id: 'consent-model',
      title: 'Your privacy choices',
      body:
        'The first visit banner lets you choose:\n\n• Accept all — useful features plus advertising\n• Accept functional — useful features without advertising\n• Essential only — basics for the site to work\n• Manage preferences — turn categories on or off yourself\n\nUseful categories explained simply:\n• Functional — remember weather on this device between visits; precise location helpers if you allow them\n• Advertising — Google ads when configured\n• Analytics — optional site usage measurement and Google Analytics when configured (not turned on by “Accept all”)\n\nChange your mind later under Settings → Cookies when the floating Settings control is available (it can hide while scrolling, and may be offline under reduced motion).',
    },
    {
      id: 'adsense',
      title: 'Ads you might see',
      body:
        'When advertising is allowed and AdSense is configured, ads can appear on the home hero, under Your locations, under city-page tabs, and in some journal layouts. If ads are not configured or you declined advertising, you see a branded placeholder instead of a live ad. Home dashboard ad + Journal teaser are on by default (hide with NEXT_PUBLIC_SHOW_HOME_STRETCH=0).',
    },
    {
      id: 'analytics',
      title: 'Usage measurement',
      body:
        'If you switch Analytics on, the site may record simple first-party usage (such as which pages were viewed) and, when configured, load Google Analytics. Ad-slot visibility counting also needs advertising consent. Declining analytics keeps those loaders off.',
    },
    {
      id: 'data',
      title: 'We do not sell your data',
      body:
        'meridian does not sell personal data. Any future paid data product would need clear notice and fresh consent.',
    },
    {
      id: 'operators',
      title: 'For site operators',
      body:
        'Tier hardcoded free; meridian:tier unused; PremiumGate / minutely UI not wired. AdSense: GOOGLE_ADSENSE_CLIENT_ID plus GOOGLE_ADSENSE_SLOT_DASHBOARD, GOOGLE_ADSENSE_SLOT_HERO, GOOGLE_ADSENSE_SLOT_RECENT, GOOGLE_ADSENSE_SLOT_CITY_DETAIL, GOOGLE_ADSENSE_SLOT_DEFAULT. Active AdSlots: dashboard, hero, city-detail; recent-checks placement has no home UI. Placeholders: public/ads/*.png (sr-only overlay). Analytics: SiteAnalyticsBeacon + POST /api/analytics/collect when consent.analytics; GA4 needs NEXT_PUBLIC_GA_MEASUREMENT_ID + same consent. Stripe not implemented.',
    },
  ],
};
