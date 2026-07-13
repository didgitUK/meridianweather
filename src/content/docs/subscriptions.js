export const subscriptionsDoc = {
  slug: 'subscriptions',
  title: 'Subscriptions',
  lastUpdated: '2026-07-09',
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
        'newsletter — meridian product updates from the footer NewsletterSignup. city_weekly — weekly digest email for a saved city. city_alerts — rain and storm notifications when conditions match (see alert rules). Types are stored in SQLite subscriptions.type and mirrored in meridian:subscriptions local registry.',
    },
    {
      id: 'client-linking',
      title: 'Client ID and local registry',
      body:
        'On first visit a UUID is written to meridian:client-id. POST /api/subscriptions associates email + preferences with this clientId. GET /api/subscriptions?clientId= hydrates meridian:subscriptions on load. DELETE deactivates by clientId, city coordinates, and types.',
    },
    {
      id: 'subscribe-ui',
      title: 'Subscribe modal',
      body:
        'On each weather card and city detail: email field, weekly digest checkbox, alerts checkbox (both alert flags stored as alert_on_rain and alert_on_storm — UI sets both true when alerts enabled). Smart labels show Subscribed / Manage when already active. Newsletter in footer uses the same API with type newsletter.',
    },
    {
      id: 'emails',
      title: 'Email delivery',
      body:
        'Resend sends React Email templates from src/emails/: welcome (newsletter), weekly digest, weather alert. Requires RESEND_API_KEY and RESEND_FROM_EMAIL. Without a key, API writes subscriptions but send functions no-op. Set NEXT_PUBLIC_APP_URL for correct unsubscribe links in production emails.',
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
        'GET /api/cron/weekly-digests with Authorization: Bearer CRON_SECRET. Loads active city_weekly subscriptions, batches unique cities, fetches weather, sends digest emails via Resend. Schedule externally (e.g. Vercel cron, GitHub Actions) — no schedule ships in-repo.',
    },
    {
      id: 'cron-alerts',
      title: 'Weather alerts cron',
      body:
        'GET /api/cron/weather-alerts with Bearer CRON_SECRET. For city_alerts subscriptions, checks current condition/description for “rain” or “thunder” (case-insensitive). Dedup via subscription_send_log so the same alert is not emailed twice for the same city/condition window.',
    },
    {
      id: 'remove-city',
      title: 'Remove city integration',
      body:
        'Deleting a saved city clears L0 weather cache. If subscriptions exist for that city, RemoveCityDialog prompts to unsubscribe from weekly and/or alerts before confirming removal.',
    },
  ],
};
