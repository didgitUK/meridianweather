import { getEmailTemplate, upsertEmailTemplate } from '@/lib/email-templates/email-template-repo';
import { renderEmailTemplateContent } from '@/lib/email-templates/render-email-template';
import { buildWeeklyDigestLocationsHtml } from '@/lib/email-templates/build-weekly-digest-locations-html';
import { sendTransactionalEmail } from '@/lib/server/email-provider';
import { DEFAULT_EMAIL_TEMPLATES, EMAIL_TEMPLATE_SLUGS } from '@/constants/email-templates';
import { formatConditionLabel, formatTemperature } from '@/features/weather/utils/formatWeather';

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

  const rendered = renderEmailTemplateContent(template, vars);

  return sendTransactionalEmail({
    to,
    subject: rendered.subject,
    html: rendered.html,
  });
}

export async function sendWelcomeEmail(email) {
  return sendTemplatedEmail({
    slug: EMAIL_TEMPLATE_SLUGS.WELCOME,
    to: email,
    vars: { email },
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

  if (template.html.includes('{{locationsHtml}}')) return;

  const legacyDefault = 'Weekly weather for {{cityName}}';
  if (template.subject === legacyDefault || !template.isCustom) {
    const defaults = DEFAULT_EMAIL_TEMPLATES[EMAIL_TEMPLATE_SLUGS.WEEKLY_DIGEST];
    upsertEmailTemplate(EMAIL_TEMPLATE_SLUGS.WEEKLY_DIGEST, {
      subject: defaults.subject,
      html: defaults.html,
    });
  }
}

export async function sendWeatherAlertEmail({ email, cityName, condition, unsubscribeToken }) {
  return sendTemplatedEmail({
    slug: EMAIL_TEMPLATE_SLUGS.WEATHER_ALERT,
    to: email,
    vars: {
      cityName,
      condition: formatConditionLabel(condition),
      unsubscribeUrl: buildUnsubscribeUrl(unsubscribeToken),
    },
  });
}

export async function sendTestEmail({ to }) {
  return sendWelcomeEmail(to);
}
