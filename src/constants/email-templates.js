export const EMAIL_TEMPLATE_SLUGS = {
  WELCOME: 'welcome',
  WEEKLY_DIGEST: 'weekly-digest',
  WEATHER_ALERT: 'weather-alert',
};

export const EMAIL_TEMPLATE_DEFINITIONS = [
  {
    slug: EMAIL_TEMPLATE_SLUGS.WELCOME,
    label: 'Welcome',
    description: 'Sent when someone subscribes to product updates.',
    variables: ['email'],
  },
  {
    slug: EMAIL_TEMPLATE_SLUGS.WEEKLY_DIGEST,
    label: 'Weekly digest',
    description:
      'One email per subscriber covering all their digest locations. Use {{locationsHtml}} for the city sections.',
    variables: [
      'locationCount',
      'locationNames',
      'locationsHtml',
      'unsubscribeUrl',
    ],
  },
  {
    slug: EMAIL_TEMPLATE_SLUGS.WEATHER_ALERT,
    label: 'Weather alert',
    description: 'Condition-change alert for subscribed cities.',
    variables: ['cityName', 'condition', 'unsubscribeUrl'],
  },
];

function layoutShell({ preview, title, bodyHtml, includeUnsubscribe = false }) {
  const unsubscribeBlock = includeUnsubscribe
    ? `
          <div style="margin-top:32px;border-top:1px solid #e5e5e5;padding-top:16px;">
            <p style="font-family:Georgia,serif;font-size:12px;color:#666666;">
              <a href="{{unsubscribeUrl}}">Unsubscribe</a> from these emails.
            </p>
          </div>`
    : '';

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
  </head>
  <body style="font-family:Georgia,serif;background-color:#ffffff;color:#111111;margin:0;padding:0;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preview}</div>
    <div style="padding:24px;max-width:560px;margin:0 auto;">
      <p style="font-family:Georgia,serif;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">
        meridian
      </p>
      <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:500;margin:16px 0;">
        ${title}
      </h1>
      ${bodyHtml}
      ${unsubscribeBlock}
    </div>
  </body>
</html>`;
}

export const DEFAULT_EMAIL_TEMPLATES = {
  [EMAIL_TEMPLATE_SLUGS.WELCOME]: {
    slug: EMAIL_TEMPLATE_SLUGS.WELCOME,
    subject: 'Welcome to meridian',
    html: layoutShell({
      preview: 'Welcome to meridian',
      title: 'Welcome to meridian',
      bodyHtml: `
      <p style="font-family:Georgia,serif;">Thanks for subscribing with {{email}}. We will send product updates sparingly.</p>
      <p style="font-family:Georgia,serif;">Your city selections stay in your browser — no account required.</p>`,
    }),
  },
  [EMAIL_TEMPLATE_SLUGS.WEEKLY_DIGEST]: {
    slug: EMAIL_TEMPLATE_SLUGS.WEEKLY_DIGEST,
    subject: 'Your weekly weather digest',
    html: layoutShell({
      preview: 'Your weekly weather for {{locationNames}}',
      title: 'Your weekly weather',
      includeUnsubscribe: true,
      bodyHtml: `
      <p style="font-family:Georgia,serif;">Here is this week’s snapshot for {{locationCount}} location(s): {{locationNames}}.</p>
      {{locationsHtml}}
      <p style="font-family:Georgia,serif;font-size:12px;color:#666666;">Use the link under each city to stop digests for that location only.</p>`,
    }),
  },
  [EMAIL_TEMPLATE_SLUGS.WEATHER_ALERT]: {
    slug: EMAIL_TEMPLATE_SLUGS.WEATHER_ALERT,
    subject: 'Weather alert for {{cityName}}',
    html: layoutShell({
      preview: 'Weather alert for {{cityName}}',
      title: 'Weather alert for {{cityName}}',
      includeUnsubscribe: true,
      bodyHtml: `
      <p style="font-family:Georgia,serif;">Conditions have changed to {{condition}}.</p>
      <p style="font-family:Georgia,serif;">Open meridian to review the latest forecast for your saved cities.</p>`,
    }),
  },
};

export const EMAIL_TEMPLATE_PREVIEW_VARS = {
  [EMAIL_TEMPLATE_SLUGS.WELCOME]: {
    email: 'you@example.com',
  },
  [EMAIL_TEMPLATE_SLUGS.WEEKLY_DIGEST]: {
    locationCount: '2',
    locationNames: 'Manchester, Dubai',
    locationsHtml: `
      <div style="margin:20px 0;padding:16px 0;border-top:1px solid #e5e5e5;">
        <p style="font-family:Georgia,serif;font-size:18px;font-weight:600;margin:0 0 8px;">Manchester</p>
        <p style="font-family:Georgia,serif;margin:0 0 4px;">Current conditions: 14° — Partly cloudy</p>
        <p style="font-family:Georgia,serif;margin:0 0 8px;">Humidity 62% · Wind 4.2 m/s</p>
        <p style="font-family:Georgia,serif;font-size:12px;margin:0;">
          <a href="https://meridianweather.co.uk/api/unsubscribe?token=preview-manchester">Stop digest for Manchester</a>
        </p>
      </div>
      <div style="margin:20px 0;padding:16px 0;border-top:1px solid #e5e5e5;">
        <p style="font-family:Georgia,serif;font-size:18px;font-weight:600;margin:0 0 8px;">Dubai</p>
        <p style="font-family:Georgia,serif;margin:0 0 4px;">Current conditions: 34° — Clear</p>
        <p style="font-family:Georgia,serif;margin:0 0 8px;">Humidity 41% · Wind 3.1 m/s</p>
        <p style="font-family:Georgia,serif;font-size:12px;margin:0;">
          <a href="https://meridianweather.co.uk/api/unsubscribe?token=preview-dubai">Stop digest for Dubai</a>
        </p>
      </div>`,
    unsubscribeUrl: 'https://meridianweather.co.uk/api/unsubscribe?token=preview',
  },
  [EMAIL_TEMPLATE_SLUGS.WEATHER_ALERT]: {
    cityName: 'Manchester',
    condition: 'Rain',
    unsubscribeUrl: 'https://meridianweather.co.uk/api/unsubscribe?token=preview',
  },
};
