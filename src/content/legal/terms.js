export const termsPolicy = {
  slug: 'terms',
  title: 'Terms of Use',
  lastUpdated: '2026-07-09',
  sections: [
    {
      id: 'service',
      title: 'Service',
      body:
        'meridian provides multi-city weather monitoring and optional email updates. Forecast data is supplied by OpenWeather and may be inaccurate or delayed. Do not rely on meridian for safety-critical decisions.',
    },
    {
      id: 'tiers',
      title: 'Free and Premium',
      body:
        'Free tier may show Google AdSense advertisements when configured and when you consent to advertising. Premium (when purchased or enabled in dev) removes ads and unlocks minutely precipitation on city detail. Hourly and daily detail views are available on free tier today. Stripe billing is not yet live.',
    },
    {
      id: 'browser-only',
      title: 'Per-browser data',
      body:
        'Saved cities and preferences are stored on your device. They do not sync across browsers or devices without your manual action.',
    },
    {
      id: 'acceptable-use',
      title: 'Acceptable use',
      body:
        'Do not abuse APIs, scrape keys, automate excessive upstream weather requests, or attempt to disrupt the service.',
    },
    {
      id: 'api-dependency',
      title: 'Third-party dependencies',
      body:
        'Availability depends on OpenWeather, Resend (email), Google AdSense (ads), and hosting providers. We may throttle refreshes or serve cached data when quotas are reached.',
    },
    {
      id: 'email',
      title: 'Email subscriptions',
      body:
        'You must provide a valid email and opt in to each subscription type. Unsubscribe links are included in emails. We may stop sending if delivery fails repeatedly.',
    },
    {
      id: 'liability',
      title: 'Liability',
      body:
        'meridian is provided as-is without warranty. Operators are not liable for decisions made based on forecast data.',
    },
  ],
};
