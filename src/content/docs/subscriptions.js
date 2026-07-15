export const subscriptionsDoc = {
  slug: 'subscriptions',
  title: 'Subscriptions',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      body:
        'meridian supports optional email: platform newsletter (product updates) and per-city weekly digests plus weather alerts. All subscriptions require explicit opt-in. No account — an anonymous UUID clientId in meridian:client-id links browser UI to server rows.',
    },
    {
      id: 'types',
      title: 'Subscription types',
      body:
        'newsletter — meridian product updates from the footer NewsletterSignup. city_weekly — weekly digest email for a saved city. city_alerts — notifications when enabled alert types match (see alert rules). Types are stored in SQLite subscriptions.type and mirrored in meridian:subscriptions local registry.',
    },
    {
      id: 'client-linking',
      title: 'Client ID and local registry',
      body:
        'On first visit a UUID is written to meridian:client-id. POST /api/subscriptions associates email + preferences with this clientId. GET /api/subscriptions?clientId= hydrates meridian:subscriptions on load. DELETE deactivates by clientId, city coordinates, and types.',
    },
    {
      id: 'alert-prefs',
      title: 'Alert preferences',
      body:
        'city_alerts rows store alert_prefs_json — a boolean map keyed by alert type id (rain, wind, thunderstorm, snow, ice, extreme_heat, fog, severity levels, hydrological, air quality, marine, UV, US severe weather, and more — see ALL_ALERT_TYPES in constants/alert-types.js). PATCH /api/subscriptions updates partial alertPrefs on an existing alerts row. Legacy alert_on_rain and alert_on_storm columns are kept in sync on create.',
    },
    {
      id: 'subscribe-ui',
      title: 'Subscribe modal',
      body:
        'On each weather card and city detail Options menu: email field, weekly digest checkbox, and granular alert toggles (or enable-all). Smart labels show Subscribed / Manage when already active. Weekly digests are capped at MAX_WEEKLY_DIGEST_LOCATIONS = 20 per email address. Newsletter in footer uses the same API with type newsletter.',
    },
    {
      id: 'emails',
      title: 'Email delivery',
      body:
        'sendTransactionalEmail routes through the active ESP connector (Resend, SendGrid, SES, or SMTP) selected in admin. React Email templates from src/emails/ and SQLite email_templates: welcome (newsletter), weekly digest, weather alert (per alert type slug). Without a configured connector, API writes subscriptions but send functions return { sent: false }. Set NEXT_PUBLIC_APP_URL for correct unsubscribe links in production emails.',
    },
    {
      id: 'unsubscribe',
      title: 'Unsubscribe',
      body:
        'Each subscription has a unique unsubscribe_token. GET /api/unsubscribe?token= deactivates that row and shows confirmation. Email templates link to this route. Removing a city can optionally unsubscribe via RemoveCityDialog.',
    },
    {
      id: 'cron-weekly',
      title: 'Weekly digest cron',
      body:
        'GET /api/cron/weekly-digests with Authorization: Bearer CRON_SECRET. Loads active city_weekly subscriptions grouped by email, batches unique cities, fetches current weather per city, and sends one digest per email via the active connector. Schedule externally (e.g. Vercel cron, GitHub Actions) — no schedule ships in-repo.',
    },
    {
      id: 'cron-alerts',
      title: 'Weather alerts cron',
      body:
        'GET /api/cron/weather-alerts with Bearer CRON_SECRET. For each city_alerts subscription, evaluates enabled alertPrefs against merged matches from evaluateOpenWeatherAlertMatches (current conditions), evaluateOfficialAlertMatches (Open-Meteo national warnings), and NWS active alerts when platform toggles allow. Dedup via subscription_send_log so the same alert is not emailed twice for the same city/condition window.',
    },
    {
      id: 'remove-city',
      title: 'Remove city integration',
      body:
        'Deleting a saved city clears L0 weather cache. If subscriptions exist for that city, RemoveCityDialog prompts to unsubscribe from weekly and/or alerts before confirming removal.',
    },
  ],
};
