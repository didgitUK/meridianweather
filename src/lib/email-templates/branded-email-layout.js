import { BRAND } from '@/constants/brand';
import {
  EMAIL_BRAND_IMAGES,
  EMAIL_LAYOUT_MARKER,
  getAlertEmailTheme,
  getEmailTemplateTheme,
} from '@/constants/email-template-themes';
import { EMAIL_TEMPLATE_SLUGS, weatherAlertTemplateSlug } from '@/constants/email-template-slugs';

const FONT =
  "font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;";

/**
 * Shared Meridian branded shell — black logo header, accent banner, body, footer.
 *
 * @param {{
 *   title: string,
 *   preview: string,
 *   eyebrow: string,
 *   accentColor: string,
 *   imageHtml?: string,
 *   bodyHtml: string,
 *   footerHtml: string,
 * }} options
 */
export function buildBrandedEmailHtml({
  title,
  preview,
  eyebrow,
  accentColor,
  imageHtml = '',
  bodyHtml,
  footerHtml,
}) {
  return `${EMAIL_LAYOUT_MARKER}
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="${FONT}background-color:#f4f4f4;color:#000000;margin:0;padding:20px;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preview}</div>
    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border:1px solid #000000;">
      <div style="background-color:#000000;padding:24px;text-align:center;">
        <img src="{{logoUrl}}" alt="${BRAND.name}" width="160" style="display:block;margin:0 auto;max-width:160px;height:auto;border:0;" />
      </div>
      <div style="height:4px;line-height:4px;font-size:0;background-color:${accentColor};">&nbsp;</div>
      <div style="padding:20px 32px 8px 32px;">
        <p style="${FONT}margin:0 0 6px 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${accentColor};font-weight:700;">
          ${eyebrow}
        </p>
      </div>
      ${imageHtml}
      <div style="padding:8px 32px 32px 32px;">
        ${bodyHtml}
      </div>
      <div style="background-color:#0a0a0a;padding:24px;text-align:center;">
        ${footerHtml}
      </div>
    </div>
  </body>
</html>`;
}

function heroImageBlock({ altShortcode = '{{cityName}}', credit = true } = {}) {
  const creditLine = credit
    ? `<p style="${FONT}margin:8px 32px 0 32px;font-size:11px;color:#888888;">{{heroImageCredit}}</p>`
    : '';
  return `
      <div style="width:100%;height:200px;overflow:hidden;background-color:#e5e5e5;line-height:0;">
        <img src="{{heroImageUrl}}" alt="${altShortcode}" width="600" height="200" style="width:100%;height:200px;object-fit:cover;display:block;border:0;" />
      </div>
      ${creditLine}`;
}

function brandImageBlock(brandImageKey) {
  const src = EMAIL_BRAND_IMAGES[brandImageKey] ?? EMAIL_BRAND_IMAGES.auth;
  return `
      <div style="width:100%;height:180px;overflow:hidden;background-color:#e5e5e5;line-height:0;">
        <img src="${src}" alt="${BRAND.name}" width="600" height="180" style="width:100%;height:180px;object-fit:cover;display:block;border:0;" />
      </div>`;
}

function imageHtmlForTheme(theme) {
  if (theme.imageMode === 'hero') {
    return heroImageBlock();
  }
  if (theme.imageMode === 'brand') {
    return brandImageBlock(theme.brandImageKey ?? 'auth');
  }
  return '';
}

function mailingFooter({ unsubscribeLabel }) {
  return `
        <p style="${FONT}margin:0 0 8px 0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#ffffff;">
          ${BRAND.name}
        </p>
        <p style="${FONT}margin:0 0 16px 0;font-size:12px;color:#a3a3a3;">
          ${BRAND.tagline}
        </p>
        <p style="${FONT}margin:0;font-size:12px;color:#d4d4d4;">
          <a href="{{unsubscribeUrl}}" style="color:#ffffff;text-decoration:underline;">Unsubscribe</a>
          ${unsubscribeLabel}
        </p>
        <p style="${FONT}margin:12px 0 0 0;font-size:11px;color:#737373;">
          <a href="{{appUrl}}" style="color:#a3a3a3;text-decoration:none;">${BRAND.domain}</a>
        </p>`;
}

function appOnlyFooter() {
  return `
        <p style="${FONT}margin:0 0 8px 0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#ffffff;">
          ${BRAND.name}
        </p>
        <p style="${FONT}margin:0 0 12px 0;font-size:12px;color:#a3a3a3;">
          ${BRAND.tagline}
        </p>
        <p style="${FONT}margin:0;font-size:12px;">
          <a href="{{appUrl}}" style="color:#ffffff;text-decoration:underline;">{{appUrl}}</a>
        </p>`;
}

/**
 * Weather alert (shared or per-type) branded HTML.
 * @param {{ id?: string, label?: string } | null | undefined} alertType
 */
export function buildWeatherAlertEmailHtml(alertType = null) {
  const theme = getAlertEmailTheme(alertType);
  const cityTitle = '{{cityName}}';

  return buildBrandedEmailHtml({
    title: `${theme.eyebrow} for {{cityName}} - {{temperature}}`,
    preview: `${theme.eyebrow} for {{cityName}} — {{temperature}} {{description}}`,
    eyebrow: theme.eyebrow,
    accentColor: theme.accentColor,
    imageHtml: imageHtmlForTheme(theme),
    bodyHtml: `
        <h1 style="${FONT}font-size:26px;font-weight:700;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:0.04em;">
          ${cityTitle}
        </h1>
        ${theme.leadHtml}
        <p style="${FONT}margin:0 0 20px 0;font-size:14px;color:#666666;">
          <img src="{{iconUrlPng}}" alt="" width="48" height="48" style="vertical-align:middle;margin-right:8px;border:0;" />
          {{alertLabel}}: {{matchLabel}} · {{temperature}} · {{weatherCondition}}
        </p>
        <div style="margin-bottom:36px;">
          {{currentCardHtml}}
        </div>
        <div style="border-top:2px solid #000000;padding-top:24px;">
          <h2 style="${FONT}font-size:16px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 16px 0;">10-Day Forecast</h2>
          {{dailyForecastHtml}}
        </div>`,
    footerHtml: mailingFooter({ unsubscribeLabel: ' from alerts for {{cityName}}' }),
  });
}

/**
 * Branded mailing / auth / admin body wrapped in the shell.
 * @param {{
 *   slug: string,
 *   title: string,
 *   preview: string,
 *   bodyAfterLeadHtml?: string,
 *   footer: 'unsubscribe' | 'unsubscribe-city' | 'unsubscribe-digest' | 'app',
 * }} options
 */
export function buildThemedEmailHtml({
  slug,
  title,
  preview,
  bodyAfterLeadHtml = '',
  footer = 'app',
}) {
  const theme = getEmailTemplateTheme(slug);
  let footerHtml = appOnlyFooter();
  if (footer === 'unsubscribe') {
    footerHtml = mailingFooter({ unsubscribeLabel: ' from these emails.' });
  } else if (footer === 'unsubscribe-city') {
    footerHtml = mailingFooter({ unsubscribeLabel: ' from alerts for {{cityName}}' });
  } else if (footer === 'unsubscribe-digest') {
    footerHtml = mailingFooter({ unsubscribeLabel: ' from digests.' });
  }

  return buildBrandedEmailHtml({
    title,
    preview,
    eyebrow: theme.eyebrow,
    accentColor: theme.accentColor,
    imageHtml: imageHtmlForTheme(theme),
    bodyHtml: `${theme.leadHtml}${bodyAfterLeadHtml}`,
    footerHtml,
  });
}

export function buildWelcomeEmailHtml() {
  return buildThemedEmailHtml({
    slug: EMAIL_TEMPLATE_SLUGS.WELCOME,
    title: 'Welcome to meridian',
    preview: 'Welcome to meridian',
    bodyAfterLeadHtml: `
        <p style="${FONT}margin:0;font-size:14px;color:#666666;">Your city selections stay on your device — no account required.</p>`,
    footer: 'unsubscribe',
  });
}

export function buildWeeklyDigestEmailHtml() {
  return buildThemedEmailHtml({
    slug: EMAIL_TEMPLATE_SLUGS.WEEKLY_DIGEST,
    title: 'Your weekly weather',
    preview: 'Your weekly weather for {{locationNames}}',
    bodyAfterLeadHtml: `
        {{locationsHtml}}
        <p style="${FONT}margin:20px 0 0 0;font-size:12px;color:#666666;">Use the link under each city to stop digests for that location only.</p>`,
    footer: 'unsubscribe-digest',
  });
}

function ctaButton(hrefShortcode, label) {
  return `
        <p style="${FONT}margin:24px 0;">
          <a href="${hrefShortcode}" style="display:inline-block;background-color:#000000;color:#ffffff;text-decoration:none;padding:12px 22px;font-size:14px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">
            ${label}
          </a>
        </p>`;
}

export function buildAuthInviteEmailHtml() {
  return buildThemedEmailHtml({
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_INVITE,
    title: 'Admin invitation',
    preview: 'Accept your meridian admin invite',
    bodyAfterLeadHtml: `
        ${ctaButton('{{inviteUrl}}', 'Accept invitation')}
        <p style="${FONT}margin:0;font-size:12px;color:#666666;">This link expires {{expiresAt}}.</p>`,
    footer: 'app',
  });
}

export function buildAuthWelcomeEmailHtml() {
  return buildThemedEmailHtml({
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_WELCOME,
    title: 'Welcome aboard',
    preview: 'Your meridian admin account is ready',
    bodyAfterLeadHtml: ctaButton('{{appUrl}}/login', 'Sign in to admin'),
    footer: 'app',
  });
}

export function buildAuthForgotPasswordEmailHtml() {
  return buildThemedEmailHtml({
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_FORGOT_PASSWORD,
    title: 'Password reset',
    preview: 'Reset your meridian admin password',
    bodyAfterLeadHtml: `
        ${ctaButton('{{resetUrl}}', 'Choose a new password')}
        <p style="${FONT}margin:0;font-size:12px;color:#666666;">This link expires {{expiresAt}}. If you did not request this, ignore this email.</p>`,
    footer: 'app',
  });
}

export function buildAuthPasswordChangedEmailHtml() {
  return buildThemedEmailHtml({
    slug: EMAIL_TEMPLATE_SLUGS.ADMIN_PASSWORD_CHANGED,
    title: 'Password updated',
    preview: 'Your meridian admin password was changed',
    bodyAfterLeadHtml: `
        <p style="${FONT}margin:0 0 16px 0;font-size:15px;line-height:1.5;color:#333333;">If you did not make this change, sign in and reset your password immediately, or contact another administrator.</p>
        ${ctaButton('{{appUrl}}/login', 'Admin sign in')}`,
    footer: 'app',
  });
}

/**
 * @param {string} slug
 * @param {{ title: string, preview: string }} meta
 */
export function buildAdminReplyEmailHtml(slug, { title, preview }) {
  return buildThemedEmailHtml({
    slug,
    title,
    preview,
    bodyAfterLeadHtml: `
        <div style="${FONT}margin:16px 0;padding:16px;border-left:3px solid #000000;background-color:#f9f9f9;">
          {{messageHtml}}
        </div>
        <p style="${FONT}margin:20px 0 0 0;font-size:15px;line-height:1.5;color:#333333;">
          Regards,<br />{{adminName}}<br />${BRAND.name}
        </p>`,
    footer: 'app',
  });
}

/** @param {{ id?: string, label?: string } | null | undefined} alertType */
export function weatherAlertDefaultSlug(alertType) {
  return alertType?.id
    ? weatherAlertTemplateSlug(alertType.id)
    : EMAIL_TEMPLATE_SLUGS.WEATHER_ALERT;
}
