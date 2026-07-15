import { ALL_ALERT_TYPES } from '@/constants/alert-types';
import {
  EMAIL_TEMPLATE_CATEGORIES,
  EMAIL_TEMPLATE_SLUGS,
  resolveWeatherAlertTemplateSlug,
  weatherAlertTemplateSlug,
} from '@/constants/email-template-slugs';
import {
  buildAdminReplyEmailHtml,
  buildAuthForgotPasswordEmailHtml,
  buildAuthInviteEmailHtml,
  buildAuthPasswordChangedEmailHtml,
  buildAuthWelcomeEmailHtml,
  buildWeatherAlertEmailHtml,
  buildWelcomeEmailHtml,
  buildWeeklyDigestEmailHtml,
  weatherAlertDefaultSlug,
} from '@/lib/email-templates/branded-email-layout';
import { buildEmailBrandVars } from '@/lib/email-templates/build-email-brand-vars';
import {
  WEATHER_ALERT_EMAIL_VARIABLES,
  buildWeatherAlertPreviewWeatherVars,
} from '@/lib/email-templates/build-weather-email-vars';

export {
  EMAIL_TEMPLATE_CATEGORIES,
  EMAIL_TEMPLATE_SLUGS,
  resolveWeatherAlertTemplateSlug,
  weatherAlertTemplateSlug,
};

export { buildWeatherAlertEmailHtml } from '@/lib/email-templates/branded-email-layout';

const BRAND_PREVIEW = buildEmailBrandVars({ appUrl: 'https://meridianweather.co.uk' });

const AUTH_EMAIL_VARIABLES = [
  'email',
  'displayName',
  'inviteUrl',
  'resetUrl',
  'expiresAt',
  'invitedBy',
  'appUrl',
  'logoUrl',
];

const ADMIN_REPLY_VARIABLES = [
  'recipientName',
  'recipientEmail',
  'subject',
  'messageHtml',
  'adminName',
  'appUrl',
  'logoUrl',
];

function buildWeatherAlertDefault(alertType) {
  const label = alertType?.label ?? 'Weather alert';
  const slug = weatherAlertDefaultSlug(alertType);

  return {
    slug,
    subject: `${label} for {{cityName}} — {{temperature}}`,
    html: buildWeatherAlertEmailHtml(alertType),
  };
}

function buildWeatherAlertDefinition(alertType) {
  const label = alertType?.label ?? 'Weather alert';
  const slug = weatherAlertDefaultSlug(alertType);

  return {
    slug,
    label,
    category: EMAIL_TEMPLATE_CATEGORIES.MAILING,
    description: alertType
      ? `Sent when a subscribed city matches the ${label} alert.`
      : 'Fallback condition-change alert for subscribed cities when a per-type template is missing.',
    variables: WEATHER_ALERT_EMAIL_VARIABLES,
  };
}

const AUTH_TEMPLATE_DEFINITIONS = [
  {
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_INVITE,
    label: 'Admin invite',
    category: EMAIL_TEMPLATE_CATEGORIES.AUTH,
    description: 'Sent when an administrator invites another admin.',
    variables: AUTH_EMAIL_VARIABLES,
  },
  {
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_WELCOME,
    label: 'Admin welcome',
    category: EMAIL_TEMPLATE_CATEGORIES.AUTH,
    description: 'Sent after an invite is accepted and the account is ready.',
    variables: AUTH_EMAIL_VARIABLES,
  },
  {
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_FORGOT_PASSWORD,
    label: 'Forgot password',
    category: EMAIL_TEMPLATE_CATEGORIES.AUTH,
    description: 'Sent when an admin requests a password reset.',
    variables: AUTH_EMAIL_VARIABLES,
  },
  {
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_PASSWORD_CHANGED,
    label: 'Password changed',
    category: EMAIL_TEMPLATE_CATEGORIES.AUTH,
    description: 'Confirmation after a successful password reset or change.',
    variables: AUTH_EMAIL_VARIABLES,
  },
];

const ADMIN_REPLY_TEMPLATE_DEFINITIONS = [
  {
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_CONTACT,
    label: 'Contact reply',
    category: EMAIL_TEMPLATE_CATEGORIES.ADMIN,
    description: 'Default first response for contact-us messages.',
    variables: ADMIN_REPLY_VARIABLES,
  },
  {
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_DPO,
    label: 'DPO reply',
    category: EMAIL_TEMPLATE_CATEGORIES.ADMIN,
    description: 'Default first response for data-protection requests.',
    variables: ADMIN_REPLY_VARIABLES,
  },
  {
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_COMPLAINT,
    label: 'Complaint reply',
    category: EMAIL_TEMPLATE_CATEGORIES.ADMIN,
    description: 'Default acknowledgement for complaints.',
    variables: ADMIN_REPLY_VARIABLES,
  },
  {
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_SUPPORT,
    label: 'Support reply',
    category: EMAIL_TEMPLATE_CATEGORIES.ADMIN,
    description: 'Default first response for support requests.',
    variables: ADMIN_REPLY_VARIABLES,
  },
];

const BASE_EMAIL_TEMPLATE_DEFINITIONS = [
  {
    slug: EMAIL_TEMPLATE_SLUGS.WELCOME,
    label: 'Welcome',
    category: EMAIL_TEMPLATE_CATEGORIES.MAILING,
    description: 'Sent when someone subscribes to product updates.',
    variables: ['email', 'unsubscribeUrl', 'appUrl', 'logoUrl'],
  },
  {
    slug: EMAIL_TEMPLATE_SLUGS.WEEKLY_DIGEST,
    label: 'Weekly digest',
    category: EMAIL_TEMPLATE_CATEGORIES.MAILING,
    description:
      'One email per subscriber covering all their digest locations. Use {{locationsHtml}} for the city sections.',
    variables: [
      'locationCount',
      'locationNames',
      'locationsHtml',
      'unsubscribeUrl',
      'cityName',
      'temperature',
      'condition',
      'humidity',
      'windSpeed',
      'appUrl',
      'logoUrl',
    ],
  },
  buildWeatherAlertDefinition(null),
  ...ALL_ALERT_TYPES.map((type) => buildWeatherAlertDefinition(type)),
  ...AUTH_TEMPLATE_DEFINITIONS,
  ...ADMIN_REPLY_TEMPLATE_DEFINITIONS,
];

export const EMAIL_TEMPLATE_DEFINITIONS = BASE_EMAIL_TEMPLATE_DEFINITIONS;

export const DEFAULT_EMAIL_TEMPLATES = {
  [EMAIL_TEMPLATE_SLUGS.WELCOME]: {
    slug: EMAIL_TEMPLATE_SLUGS.WELCOME,
    subject: 'Welcome to meridian',
    html: buildWelcomeEmailHtml(),
  },
  [EMAIL_TEMPLATE_SLUGS.WEEKLY_DIGEST]: {
    slug: EMAIL_TEMPLATE_SLUGS.WEEKLY_DIGEST,
    subject: 'Your weekly weather digest',
    html: buildWeeklyDigestEmailHtml(),
  },
  [EMAIL_TEMPLATE_SLUGS.WEATHER_ALERT]: buildWeatherAlertDefault(null),
  ...Object.fromEntries(
    ALL_ALERT_TYPES.map((type) => {
      const defaults = buildWeatherAlertDefault(type);
      return [defaults.slug, defaults];
    }),
  ),
  [EMAIL_TEMPLATE_SLUGS.ADMIN_INVITE]: {
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_INVITE,
    subject: 'You are invited to administer meridian',
    html: buildAuthInviteEmailHtml(),
  },
  [EMAIL_TEMPLATE_SLUGS.ADMIN_WELCOME]: {
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_WELCOME,
    subject: 'Your meridian admin account is ready',
    html: buildAuthWelcomeEmailHtml(),
  },
  [EMAIL_TEMPLATE_SLUGS.ADMIN_FORGOT_PASSWORD]: {
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_FORGOT_PASSWORD,
    subject: 'Reset your meridian admin password',
    html: buildAuthForgotPasswordEmailHtml(),
  },
  [EMAIL_TEMPLATE_SLUGS.ADMIN_PASSWORD_CHANGED]: {
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_PASSWORD_CHANGED,
    subject: 'Your meridian admin password was changed',
    html: buildAuthPasswordChangedEmailHtml(),
  },
  [EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_CONTACT]: {
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_CONTACT,
    subject: '{{subject}}',
    html: buildAdminReplyEmailHtml(EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_CONTACT, {
      title: 'Thanks for contacting us',
      preview: 'Thanks for contacting meridian',
    }),
  },
  [EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_DPO]: {
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_DPO,
    subject: '{{subject}}',
    html: buildAdminReplyEmailHtml(EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_DPO, {
      title: 'Data protection response',
      preview: 'Data protection response from meridian',
    }),
  },
  [EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_COMPLAINT]: {
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_COMPLAINT,
    subject: '{{subject}}',
    html: buildAdminReplyEmailHtml(EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_COMPLAINT, {
      title: 'We have received your complaint',
      preview: 'Complaint acknowledgement from meridian',
    }),
  },
  [EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_SUPPORT]: {
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_SUPPORT,
    subject: '{{subject}}',
    html: buildAdminReplyEmailHtml(EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_SUPPORT, {
      title: 'Support update',
      preview: 'Support response from meridian',
    }),
  },
};

const AUTH_PREVIEW_VARS = {
  ...BRAND_PREVIEW,
  email: 'alex@example.com',
  displayName: 'Alex Admin',
  inviteUrl: 'https://meridianweather.co.uk/invite/preview-token',
  resetUrl: 'https://meridianweather.co.uk/reset-password/preview-token',
  expiresAt: '16 Jul 2026, 12:00',
  invitedBy: 'Jordan Host',
};

const ADMIN_REPLY_PREVIEW_VARS = {
  ...BRAND_PREVIEW,
  recipientName: 'Sam Neighbor',
  recipientEmail: 'sam@example.com',
  subject: 'Re: Your message to meridian',
  messageHtml: '<p>Thanks again — we will keep you updated.</p>',
  adminName: 'Alex Admin',
};

export const EMAIL_TEMPLATE_PREVIEW_VARS = {
  [EMAIL_TEMPLATE_SLUGS.WELCOME]: {
    ...BRAND_PREVIEW,
    email: 'you@example.com',
    unsubscribeUrl: 'https://meridianweather.co.uk/api/unsubscribe?token=preview-welcome',
  },
  [EMAIL_TEMPLATE_SLUGS.WEEKLY_DIGEST]: {
    ...BRAND_PREVIEW,
    locationCount: '2',
    locationNames: 'Manchester, Dubai',
    locationsHtml: `
      <div style="margin:20px 0;padding:16px 0;border-top:1px solid #e5e5e5;">
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:18px;font-weight:600;margin:0 0 8px;">Manchester</p>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 4px;">Current conditions: 14°C — Partly cloudy</p>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 8px;">Humidity 62% · Wind 4.2 m/s</p>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;margin:0;">
          <a href="https://meridianweather.co.uk/api/unsubscribe?token=preview-manchester">Stop digest for Manchester</a>
        </p>
      </div>
      <div style="margin:20px 0;padding:16px 0;border-top:1px solid #e5e5e5;">
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:18px;font-weight:600;margin:0 0 8px;">Dubai</p>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 4px;">Current conditions: 34° — Clear</p>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 8px;">Humidity 41% · Wind 3.1 m/s</p>
        <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;margin:0;">
          <a href="https://meridianweather.co.uk/api/unsubscribe?token=preview-dubai">Stop digest for Dubai</a>
        </p>
      </div>`,
    unsubscribeUrl: 'https://meridianweather.co.uk/api/unsubscribe?token=preview',
    cityName: 'Manchester',
    temperature: '14°C',
    condition: 'Partly cloudy',
    humidity: '62',
    windSpeed: '4.2',
  },
  [EMAIL_TEMPLATE_SLUGS.WEATHER_ALERT]: buildWeatherAlertPreviewWeatherVars(null),
  ...Object.fromEntries(
    ALL_ALERT_TYPES.map((type) => [
      weatherAlertTemplateSlug(type.id),
      buildWeatherAlertPreviewWeatherVars(type),
    ]),
  ),
  [EMAIL_TEMPLATE_SLUGS.ADMIN_INVITE]: AUTH_PREVIEW_VARS,
  [EMAIL_TEMPLATE_SLUGS.ADMIN_WELCOME]: AUTH_PREVIEW_VARS,
  [EMAIL_TEMPLATE_SLUGS.ADMIN_FORGOT_PASSWORD]: AUTH_PREVIEW_VARS,
  [EMAIL_TEMPLATE_SLUGS.ADMIN_PASSWORD_CHANGED]: AUTH_PREVIEW_VARS,
  [EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_CONTACT]: ADMIN_REPLY_PREVIEW_VARS,
  [EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_DPO]: ADMIN_REPLY_PREVIEW_VARS,
  [EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_COMPLAINT]: ADMIN_REPLY_PREVIEW_VARS,
  [EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_SUPPORT]: ADMIN_REPLY_PREVIEW_VARS,
};
