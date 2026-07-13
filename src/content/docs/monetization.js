export const monetizationDoc = {
  slug: 'monetization',
  title: 'Monetization & consent',
  lastUpdated: '2026-07-09',
  sections: [
    {
      id: 'tiers',
      title: 'Free and Premium tiers',
      body:
        'meridian:tier stores free or premium in localStorage. Free tier may show Google AdSense when configured. Premium removes ads and unlocks the minutely precipitation strip on city detail. Stripe checkout is not implemented; dev tier toggle is in the admin modal (Ctrl+Shift+L).',
    },
    {
      id: 'premium-features',
      title: 'What Premium unlocks today',
      body:
        'Implemented: no ad script load, minutely forecast visible on city detail. Marketing copy references “full 10-day outlook” but daily/hourly on city detail are not gated in code — only MinutelyPrecipStrip uses PremiumGate. PremiumBadge component exists but is unused in UI.',
    },
    {
      id: 'consent-model',
      title: 'Consent model',
      body:
        'meridian:consent JSON fields: essential (always on), functional (weather cache preference), marketing (reserved), analytics (coming soon), advertising (AdSense). meridian:cookie-consent legacy flag. Cookie banner: Accept (functional), Accept all (functional + advertising), Manage preferences. Footer link “Privacy preferences” reopens the dialog anytime.',
    },
    {
      id: 'adsense',
      title: 'Google AdSense (live)',
      body:
        'When GOOGLE_ADSENSE_CLIENT_ID and placement slot env vars are set, AdSense is live — not placeholders. AdSenseProvider loads the script once after advertising consent on free tier. GET /api/ads/config returns script config; GET /api/ads?placement= returns per-slot config. GET /ads.txt serves publisher verification from env. Client ID validated server-side (ca-pub-… format); never committed to git.',
    },
    {
      id: 'placements',
      title: 'Ad placements',
      body:
        'Active UI placements: dashboard (below city grid), recent-checks (below strip). Defined but unused: hero (env GOOGLE_ADSENSE_SLOT_HERO exists). Without slot IDs, placements show “not configured” while auto ads may still run from script. Dev test mode shows dashed placeholder when AdSense env is unset.',
    },
    {
      id: 'adslot-states',
      title: 'AdSlot UI states',
      body:
        'Premium tier — hidden. No consent — message with link to privacy preferences. Not configured — placeholder explaining slots. Test mode — monetization doc link placeholder. Configured + consent — ins.adsbygoogle unit rendered after script ready.',
    },
    {
      id: 'stripe',
      title: 'Stripe (planned)',
      body:
        'Premium upgrade button in PremiumGate is disabled (“coming soon”). Future Stripe integration would set tier server-side; v1 tier is client-only for demonstration.',
    },
    {
      id: 'data',
      title: 'Data licensing',
      body:
        'meridian v1 does not sell or license user data. Analytics consent category is reserved. Any future B2B or anonymised analytics requires separate consent and policy updates.',
    },
  ],
};
