export const monetizationDoc = {
  slug: 'monetization',
  title: 'Monetization',
  lastUpdated: '2026-07-21',
  sections: [
    {
      id: 'advertising',
      title: 'Advertising (AdSense)',
      body:
        'Google AdSense Auto ads run when GOOGLE_ADSENSE_CLIENT_ID (or MERIDIAN_ADSENSE_CLIENT_ID) is set and the visitor has turned on advertising consent. The adsbygoogle.js runtime loader injects only after that consent. Root HTML may include a google-adsense-account meta tag for publisher verification without loading the script. Ad-free licenses suppress fills. Placeholder PNGs under public/ads/ remain for offline or unfilled creatives.',
    },
    {
      id: 'ad-free',
      title: 'Ad-free (Stripe)',
      body:
        'Optional Stripe checkout removes ads on this device (license cookie). Requires STRIPE_* keys and ADFEEE_LICENSE_SECRET. When billing is not configured, Settings → Remove ads shows an unavailable status — no fake checkout buttons. Restore-by-email and Customer Portal live under /api/billing/*.',
    },
    {
      id: 'premium',
      title: 'Weather Premium',
      body:
        'There is no paid weather Premium tier. meridian:tier is reserved and unused. The minutely precipitation API scope may exist for future use but is not a gated product UI.',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      body:
        'SiteAnalyticsBeacon posts to /api/analytics/collect when analytics consent is on. The collect route trusts the signed meridian_consent HttpOnly cookie only (not body consent flags) and requires same-origin. GA4 needs NEXT_PUBLIC_GA_MEASUREMENT_ID plus analytics consent. “Accept all” on the cookie banner enables functional + advertising, not analytics.',
    },
  ],
};
