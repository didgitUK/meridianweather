export const privacyPolicy = {
  slug: 'privacy',
  title: 'Privacy Policy',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'who-we-are',
      title: 'Who we are',
      body:
        'Website Servers Ltd (“we”, “us”) is the data controller for meridian, a trading name of the company. We are registered in England and Wales under company number 17240780. Registered office: Orchard Cottage, Beck Orchard, Brampton, United Kingdom, CA8 1UR.\n\nProduct site: meridianweather.co.uk. Group site: websiteservers.co.uk. Privacy contact: privacy@meridianweather.co.uk.\n\nThis policy explains how we process personal data when you use meridian. It is written to align with the UK GDPR and the Data Protection Act 2018, and to give clear notice to visitors outside the UK. It is product policy, not legal advice.',
    },
    {
      id: 'overview',
      title: 'Overview',
      body:
        'You do not need a public account to use meridian. Most city lists and display preferences stay in your browser. Our servers process weather requests, optional email subscriptions, optional first-party usage analytics (when you turn Analytics on), location hints used to tailor the experience, and (for staff only) administrative accounts.\n\nWe do not sell personal data. Optional advertising (Google AdSense), first-party usage analytics, and optional Google Analytics load only when the relevant consent category is on and the feature is configured. “Accept all” on the cookie banner turns on functional features and advertising — not Analytics.',
    },
    {
      id: 'data-we-collect',
      title: 'Data we collect',
      body:
        'Browser / device (typically via localStorage or sessionStorage): anonymous client ID (UUID linking optional subscriptions to this browser); saved cities and recent lookups (names, regions, coordinates); location profile (approximate or precise coordinates, label, source such as IP, GPS, or confirmed choice, and check history); weather cache; theme, temperature unit, locale, accessibility preferences, weather-refresh preferences; consent and cookie-banner flags; local mirror of email subscription preferences; optional journal comment drafts stored only on your device; analytics session ID in sessionStorage.\n\nServer when you opt in or interact: email address; subscription type (newsletter, city weekly digest, city alerts); city name and coordinates for city emails; alert preference JSON; unsubscribe tokens; weather snapshots and API diagnostic logs keyed primarily by coordinates and request metadata rather than your name.\n\nLocation signals: browser geolocation only when you allow it and functional consent is granted; approximate region from CDN or hosting headers where available; fallback IP geolocation via ipwho.is when needed to hint a home region.\n\nFirst-party analytics (only when Analytics consent is on): page path, session identifier, engaged time, and scroll depth stored in our database. Ad-slot view events also require Advertising consent. Admin dashboard routes are excluded from this beacon.\n\nStaff systems: admin email, display name, password hash, invite and password-reset tokens, session cookie, and audit logs of administrative actions. Platform configuration may include third-party API credentials used to run the Service.',
    },
    {
      id: 'legal-bases',
      title: 'Why we use data (purposes and legal bases)',
      body:
        'Provide the weather Service and security (including anonymous client ID, essential preferences, weather proxies, and abuse prevention): legitimate interests (UK GDPR Art. 6(1)(f)), and where storage is strictly necessary for a service you request, performance of a contract (Art. 6(1)(b)).\n\nOptional functional features such as weather cache writes and precise GPS when you choose them: consent (Art. 6(1)(a)), managed via our Cookie Policy and preference centre.\n\nEmail digests and alerts: consent / opt-in per subscription type (Art. 6(1)(a)); you can withdraw via unsubscribe links.\n\nAdvertising when enabled: consent (Art. 6(1)(a)).\n\nFirst-party usage analytics and Google Analytics (when configured): consent (Art. 6(1)(a)) via the Analytics preference. Ad-slot view events in first-party analytics also require Advertising consent.\n\nStaff administration: legitimate interests and, where applicable, contract with the operator.',
    },
    {
      id: 'cookies-consent',
      title: 'Cookies and similar technologies',
      body:
        'Public browsing uses browser storage more than classic first-party cookies. Advertising and optional analytics partners may set their own cookies when you consent. Full inventory and PECR controls are in our Cookie Policy. You can change or withdraw choices via the settings control (privacy / cookie preferences) or the cookie banner.',
    },
    {
      id: 'third-party',
      title: 'Who we share data with',
      body:
        'Processors and providers that help us run meridian may receive limited data as needed: OpenWeather (coordinates, search queries, locale) for weather and geocoding; Open-Meteo and US National Weather Service for certain warnings; ipwho.is for IP-based region hints; email providers such as Resend or SendGrid (and others if activated) for transactional and subscription mail; Google (AdSense and, if configured, Google Analytics) when you consent; optional hero-image providers (for example Unsplash, Wikimedia, or Pexels) using region or landmark search terms; hosting and CDN providers that may see IP addresses and request metadata.\n\nWe do not sell personal data or licence identifiable browsing profiles to third parties for their own marketing.',
    },
    {
      id: 'international',
      title: 'International transfers',
      body:
        'Some providers are based outside the United Kingdom (including in the United States or other countries). Where UK GDPR applies to a transfer, we rely on adequacy regulations where available, or on appropriate safeguards such as the supplier’s standard contractual clauses / UK addendum, together with provider terms. Requests to privacy@meridianweather.co.uk can ask for more information about safeguards for a specific transfer.',
    },
    {
      id: 'retention',
      title: 'Retention',
      body:
        'Browser data remains until you clear site data, withdraw functional consent (which clears certain functional stores), or overwrite preferences.\n\nEmail subscriptions remain until you unsubscribe or we delete them after failed delivery or a valid erasure request.\n\nWeather cache entries expire according to server TTLs. Diagnostic API logs and first-party analytics events are kept for operations and improvement; automatic purge windows may be introduced as the platform matures — contact us if you need a specific erasure of server-held identifiers tied to your email or client ID.',
    },
    {
      id: 'your-rights',
      title: 'Your rights',
      body:
        'Under UK GDPR you may have rights to access, rectification, erasure, restriction, objection, and data portability, and the right to withdraw consent at any time without affecting prior lawful processing.\n\nPractically: clear browser site data; open cookie / privacy preferences; use unsubscribe links in emails; or email privacy@meridianweather.co.uk with enough detail for us to locate your records (for example the email used to subscribe).\n\nYou may complain to the UK Information Commissioner’s Office (ICO) at ico.org.uk. If you live in the European Economic Area you may also contact your local supervisory authority.',
    },
    {
      id: 'children',
      title: 'Children',
      body:
        'meridian is not directed at children under 13. We do not knowingly collect email addresses from children for marketing. If you believe a child has provided personal data, contact privacy@meridianweather.co.uk and we will delete it where required.',
    },
    {
      id: 'recent-checks',
      title: 'Platform recent checks',
      body:
        'The home page may show two short lists of places:\n\n• Near you — suggested places near your home or region (not a private log of your searches).\n• Popular searches — places often searched across the site, from shared check logs. On a fresh or quiet install the interface may briefly show a few demo cities until real search activity exists.\n\nNeither list is a personal history of your private searches.',
    },
    {
      id: 'changes',
      title: 'Changes',
      body:
        'We may update this policy when our practices or the law change. The “Last updated” date will change when we do. Significant changes will be reflected on this page; where required we will seek fresh consent.',
    },
  ],
};
