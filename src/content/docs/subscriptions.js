export const subscriptionsDoc = {
  slug: 'subscriptions',
  title: 'Subscriptions',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'overview',
      title: 'Email updates (optional)',
      body:
        'You can ask meridian to email you — no login required. Choose a newsletter about the product, a weekly digest for a pinned city, and/or weather alerts when conditions match what you care about. Everything is opt-in; every email includes a way to stop.',
    },
    {
      id: 'types',
      title: 'What you can sign up for',
      body:
        '• Newsletter — product updates (usually from the footer form).\n• Weekly digest — a regular summary for a city you follow.\n• Weather alerts — emails when selected alert types fire for a city (rain, wind, snow, official warnings, and more).\n\nYou can manage these from Subscribe on a weather card or the city page Options menu.',
    },
    {
      id: 'subscribe-ui',
      title: 'How to subscribe',
      body:
        'Enter your email, pick weekly digest and/or alerts, and choose which alert types you want (or enable all). You can change alert types later. One email address can follow weekly digests for up to twenty locations. If you already subscribed, the button may say Subscribed or Manage.',
    },
    {
      id: 'unsubscribe',
      title: 'How to stop emails',
      body:
        'Use the unsubscribe link in any subscription email. Removing a city from Your locations may also ask whether to cancel emails for that city.',
    },
    {
      id: 'operators',
      title: 'For site operators',
      body:
        'Anonymous meridian:client-id links the browser to SQLite subscriptions. API: GET/POST/DELETE/PATCH /api/subscriptions (PATCH updates alertPrefs). Delivery uses the active connector (Resend, SendGrid, SES, or SMTP). Without a connector, rows save but sends return { sent: false }. Set NEXT_PUBLIC_APP_URL for unsubscribe links. Crons: GET /api/cron/weekly-digests and /api/cron/weather-alerts with Bearer CRON_SECRET. Alerts merge OpenWeather conditions, Open-Meteo official warnings, and NWS where enabled; dedup via subscription_send_log. MAX_WEEKLY_DIGEST_LOCATIONS = 20.',
    },
  ],
};
