export const monetizationDoc = {
  slug: 'monetization',
  title: 'Monetization & consent',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'tiers',
      title: 'Free tier (Premium reserved)',
      body:
        'The product currently operates as free only. ConsentProvider hardcodes tier free; meridian:tier is reserved and unused at runtime. Stripe checkout and PremiumGate are not wired. Ads are gated by advertising consent and AdSense config — not by a premium flag.',
    },
    {
      id: 'premium-features',
      title: 'What Premium would unlock (not shipped)',
      body:
        'Reserved / not implemented in UI: hiding AdSense for a paid tier, and a minutely precipitation strip. City detail today loads current, hourly, and daily scopes only. There is no MinutelyPrecipStrip component in the app.',
    },
    {
      id: 'consent-model',
      title: 'Consent model',
      body:
        'meridian:consent JSON fields: essential (always on), functional (weather cache localStorage writes and GPS helpers), marketing (reserved), analytics (GA4 loader when configured), advertising (AdSense). meridian:cookie-consent legacy flag. Cookie banner: Accept all, Accept functional, Essential only, Manage preferences. Reopen anytime via the floating Settings control → Cookies tab. “Accept all” enables functional + advertising; turn on Google Analytics separately in preferences if offered.',
    },
    {
      id: 'adsense',
      title: 'Google AdSense (live)',
      body:
        'When GOOGLE_ADSENSE_CLIENT_ID and placement slot env vars are set, AdSense is live — not placeholders. AdSenseProvider loads the script once after advertising consent when configured. GET /api/ads/config returns script config; GET /api/ads?placement= returns per-slot config. GET /ads.txt serves publisher verification from env. Client ID validated server-side (ca-pub-… format); never committed to git.',
    },
    {
      id: 'placements',
      title: 'Ad placements',
      body:
        'Active UI placements with AdSlot: dashboard (below city grid), hero (home hero + journal sidebar), city-detail (under tabs). Placement id recent-checks exists in constants/env but has no home-page AdSlot. Slot env vars: GOOGLE_ADSENSE_SLOT_DASHBOARD, _HERO, _RECENT, _CITY_DETAIL, _DEFAULT. Without slot IDs, placements show branded demo placeholders; auto ads may still run from script when the client ID is set.',
    },
    {
      id: 'adslot-states',
      title: 'AdSlot UI states',
      body:
        'Default (AdSense unset / no advertising consent): branded PNG placeholders under public/ads/ (banner and square). Overlay copy is screen-reader-only (sr-only), not painted on the image. GET /api/ads/placeholder-bg may still serve hero-image lookups for other surfaces. Configured + consent — ins.adsbygoogle unit after script ready.',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      body:
        'First-party SiteAnalyticsBeacon posts page path / engagement to POST /api/analytics/collect into site_analytics_events when consent.analytics is on (collect endpoint also checks the consent flag in the request body). Ad-slot view events also require consent.advertising. Optional GA4 (AnalyticsProvider) loads only when NEXT_PUBLIC_GA_MEASUREMENT_ID is set and consent.analytics is on. Cookie banner “Accept all” does not enable analytics — turn it on in Settings → Cookies.',
    },
    {
      id: 'stripe',
      title: 'Stripe (planned)',
      body:
        'Premium / Stripe checkout is not implemented. Any future billing would need server-side tier enforcement; do not treat meridian:tier as live.',
    },
    {
      id: 'data',
      title: 'Data licensing',
      body:
        'meridian does not sell or license user data. First-party analytics and optional GA4 are for operating the product. Any future B2B or anonymised analytics product would require separate consent and policy updates.',
    },
  ],
};
