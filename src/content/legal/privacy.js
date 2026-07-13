export const privacyPolicy = {
  slug: 'privacy',
  title: 'Privacy Policy',
  lastUpdated: '2026-07-09',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      body:
        'meridian stores your selected cities in your browser and processes weather requests through our server. We do not require an account. An anonymous client ID links optional email subscriptions to your browser session.',
    },
    {
      id: 'data-we-collect',
      title: 'Data we collect',
      body:
        'Browser: saved cities (up to ten), theme, weather cache L0, subscription UI registry, anonymous clientId UUID, consent JSON (essential, functional, marketing, analytics, advertising), tier preference, legacy cookie-consent flag. Server when you opt in: email address, subscription type, city coordinates for city emails, unsubscribe tokens. Server automatic: weather snapshots keyed by lat/lon/scope, API call audit log, platform settings, alert send dedup log.',
    },
    {
      id: 'legal-bases',
      title: 'Legal bases',
      body:
        'Essential storage operates the service (legitimate interest). Functional and advertising preferences rely on consent via cookie banner or privacy preferences. Email subscriptions require explicit opt-in per type. We do not sell personal data in v1.',
    },
    {
      id: 'third-party-apis',
      title: 'Third-party services',
      body:
        'OpenWeather receives coordinates for weather and geocode. Resend processes email when RESEND_API_KEY is configured. Google AdSense may load when you enable advertising consent, GOOGLE_ADSENSE_CLIENT_ID is set on the server, and you are on the free tier — Google may set its own cookies per Google’s policies.',
    },
    {
      id: 'recent-checks',
      title: 'Platform recent checks',
      body:
        'Aggregated weather lookups from shared server cache may display city names and conditions in the recent checks strip. This is not a personal history of your searches.',
    },
    {
      id: 'retention',
      title: 'Retention',
      body:
        'Browser data persists until you clear site storage or use privacy preferences. Server weather cache expires per scope TTL (see docs). Subscriptions remain until unsubscribe or deletion. api_call_log accumulates for diagnostics; no automatic purge ships in v1.',
    },
    {
      id: 'your-rights',
      title: 'Your rights',
      body:
        'Clear browser storage, unsubscribe via email links (GET /api/unsubscribe?token=), open Privacy preferences in the footer, or contact us to request access or erasure of server-held email data.',
    },
    {
      id: 'data-monetization',
      title: 'Future data use',
      body:
        'Analytics consent category is reserved. Any future anonymised analytics or B2B licensing would require separate consent and policy updates. Not active in v1.',
    },
  ],
};
