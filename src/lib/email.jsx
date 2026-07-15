import {
  getEmailTemplate,
  upsertEmailTemplate,
  ensureWeatherAlertTemplatesUseRichLayout,
} from '@/lib/email-templates/email-template-repo';
import { renderEmailTemplateContent } from '@/lib/email-templates/render-email-template';
import { buildWeeklyDigestLocationsHtml } from '@/lib/email-templates/build-weekly-digest-locations-html';
import { sendTransactionalEmail } from '@/lib/server/email-provider';
import {
  DEFAULT_EMAIL_TEMPLATES,
  EMAIL_TEMPLATE_SLUGS,
  resolveWeatherAlertTemplateSlug,
} from '@/constants/email-templates';
import { formatConditionLabel, formatTemperature } from '@/features/weather/utils/formatWeather';
import {
  buildCurrentWeatherEmailVars,
  buildDailyForecastEmailVars,
  buildEmailHeroImageVars,
} from '@/lib/email-templates/build-weather-email-vars';
import { buildEmailBrandVars } from '@/lib/email-templates/build-email-brand-vars';
import { ALERT_TYPE_BY_ID } from '@/constants/alert-types';

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

export function buildUnsubscribeUrl(token) {
  return `${getAppUrl()}/api/unsubscribe?token=${token}`;
}

async function sendTemplatedEmail({ slug, to, vars }) {
  const template = getEmailTemplate(slug);
  if (!template) {
    throw new Error(`Unknown email template: ${slug}`);
  }

  const rendered = renderEmailTemplateContent(template, {
    ...buildEmailBrandVars({ appUrl: getAppUrl() }),
    ...vars,
  });

  return sendTransactionalEmail({
    to,
    subject: rendered.subject,
    html: rendered.html,
  });
}

export { sendTemplatedEmail };

function authEmailBaseVars({ email, displayName, invitedBy = '', inviteUrl = '', resetUrl = '', expiresAt = '' }) {
  return {
    email,
    displayName,
    invitedBy,
    inviteUrl,
    resetUrl,
    expiresAt,
  };
}

export async function sendAdminInviteEmail({ email, displayName, invitedBy, inviteUrl, expiresAt }) {
  return sendTemplatedEmail({
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_INVITE,
    to: email,
    vars: authEmailBaseVars({ email, displayName, invitedBy, inviteUrl, expiresAt }),
  });
}

export async function sendAdminWelcomeEmail({ email, displayName }) {
  return sendTemplatedEmail({
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_WELCOME,
    to: email,
    vars: authEmailBaseVars({ email, displayName }),
  });
}

export async function sendAdminForgotPasswordEmail({ email, displayName, resetUrl, expiresAt }) {
  return sendTemplatedEmail({
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_FORGOT_PASSWORD,
    to: email,
    vars: authEmailBaseVars({ email, displayName, resetUrl, expiresAt }),
  });
}

export async function sendAdminPasswordChangedEmail({ email, displayName }) {
  return sendTemplatedEmail({
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_PASSWORD_CHANGED,
    to: email,
    vars: authEmailBaseVars({ email, displayName }),
  });
}

export async function sendAdminComposeEmail({ slug, to, vars }) {
  return sendTemplatedEmail({ slug, to, vars });
}

export async function sendWelcomeEmail(email, { unsubscribeToken } = {}) {
  return sendTemplatedEmail({
    slug: EMAIL_TEMPLATE_SLUGS.WELCOME,
    to: email,
    vars: {
      email,
      unsubscribeUrl: unsubscribeToken
        ? buildUnsubscribeUrl(unsubscribeToken)
        : `${getAppUrl()}/legal/privacy`,
    },
  });
}

/**
 * Send one weekly digest covering all locations for an email address.
 * @param {{
 *   email: string,
 *   locations: Array<{ cityName: string, weather: object, unsubscribeToken: string }>,
 * }} payload
 */
export async function sendWeeklyDigestEmail({ email, locations }) {
  const list = Array.isArray(locations) ? locations.filter((item) => item?.weather) : [];
  if (list.length === 0) {
    return { sent: false, reason: 'no_locations' };
  }

  ensureWeeklyDigestTemplateSupportsLocations();

  const locationNames = list.map((item) => item.cityName || 'Unknown location').join(', ');
  const locationsHtml = buildWeeklyDigestLocationsHtml(
    list.map((item) => ({
      cityName: item.cityName,
      weather: item.weather,
      unsubscribeUrl: buildUnsubscribeUrl(item.unsubscribeToken),
    })),
  );

  return sendTemplatedEmail({
    slug: EMAIL_TEMPLATE_SLUGS.WEEKLY_DIGEST,
    to: email,
    vars: {
      locationCount: String(list.length),
      locationNames,
      locationsHtml,
      unsubscribeUrl: buildUnsubscribeUrl(list[0].unsubscribeToken),
      cityName: list[0].cityName,
      temperature: formatTemperature(list[0].weather?.temperature),
      condition: formatConditionLabel(list[0].weather?.condition),
      humidity: list[0].weather?.humidity ?? '—',
      windSpeed: list[0].weather?.windSpeed ?? '—',
    },
  });
}

/**
 * Upgrade seeded legacy weekly-digest rows that still use the single-city default.
 */
function ensureWeeklyDigestTemplateSupportsLocations() {
  const template = getEmailTemplate(EMAIL_TEMPLATE_SLUGS.WEEKLY_DIGEST);
  if (!template) return;

  if (template.html.includes('{{locationsHtml}}') && template.html.includes('meridian-email-layout:')) {
    return;
  }

  const defaults = DEFAULT_EMAIL_TEMPLATES[EMAIL_TEMPLATE_SLUGS.WEEKLY_DIGEST];
  if (template.html.includes('{{locationsHtml}}') && template.isCustom) {
    return;
  }

  upsertEmailTemplate(EMAIL_TEMPLATE_SLUGS.WEEKLY_DIGEST, {
    subject: defaults.subject,
    html: defaults.html,
  });
}

export async function sendWeatherAlertEmail({
  email,
  cityName,
  condition,
  unsubscribeToken,
  alertTypeId,
  alertLabel,
  matchLabel,
  weather,
  dailyForecast = null,
}) {
  ensureWeatherAlertTemplatesUseRichLayout();

  const slug = resolveWeatherAlertTemplateSlug(alertTypeId);
  const alertType = alertTypeId ? ALERT_TYPE_BY_ID[alertTypeId] : null;
  const weatherVars = buildCurrentWeatherEmailVars(weather);
  const dailyVars = buildDailyForecastEmailVars(dailyForecast);
  const heroVars = await buildEmailHeroImageVars({
    city: cityName,
    country: weather?.country ?? null,
    lat: weather?.lat ?? null,
    lon: weather?.lon ?? null,
    temperature: weather?.temperature ?? null,
    weatherId: weather?.weatherId ?? null,
    condition: weather?.condition ?? null,
    description: weather?.description ?? null,
    icon: weather?.icon ?? null,
  });

  return sendTemplatedEmail({
    slug,
    to: email,
    vars: {
      cityName,
      condition: formatConditionLabel(condition),
      matchLabel: matchLabel ?? '',
      unsubscribeUrl: buildUnsubscribeUrl(unsubscribeToken),
      alertTypeId: alertTypeId ?? '',
      alertLabel: alertLabel ?? alertType?.label ?? '',
      alertSource: alertType?.source ?? '',
      ...weatherVars,
      ...dailyVars,
      ...heroVars,
    },
  });
}

export async function sendTestEmail({ to }) {
  const brand = buildEmailBrandVars({ appUrl: getAppUrl() });
  return sendTransactionalEmail({
    to,
    subject: 'Meridian connector test',
    html: [
      '<!-- meridian-email-layout:2 -->',
      '<!DOCTYPE html><html><body style="font-family:Helvetica,Arial,sans-serif;margin:0;padding:24px;background:#f4f4f4;">',
      '<div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #000;">',
      '<div style="background:#000;padding:20px;text-align:center;">',
      `<img src="${brand.logoUrl}" alt="meridian" width="140" style="display:block;margin:0 auto;border:0;" />`,
      '</div>',
      '<div style="padding:28px;">',
      '<p>This is a Meridian email-connector test message.</p>',
      '<p>If you received it, your active email connector can send successfully.</p>',
      '</div></div></body></html>',
    ].join(''),
  });
}
