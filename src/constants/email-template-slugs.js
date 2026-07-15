import { ALL_ALERT_TYPES } from '@/constants/alert-types';

/**
 * Client-safe email template slug helpers.
 * Keep this module free of DB / hero / nodemailer imports so admin UI can use it.
 */

export const EMAIL_TEMPLATE_CATEGORIES = {
  MAILING: 'mailing',
  AUTH: 'auth',
  ADMIN: 'admin',
};

export const EMAIL_TEMPLATE_SLUGS = {
  WELCOME: 'welcome',
  WEEKLY_DIGEST: 'weekly-digest',
  WEATHER_ALERT: 'weather-alert',
  ADMIN_INVITE: 'admin-invite',
  ADMIN_WELCOME: 'admin-welcome',
  ADMIN_FORGOT_PASSWORD: 'admin-forgot-password',
  ADMIN_PASSWORD_CHANGED: 'admin-password-changed',
  ADMIN_REPLY_CONTACT: 'admin-reply-contact',
  ADMIN_REPLY_DPO: 'admin-reply-dpo',
  ADMIN_REPLY_COMPLAINT: 'admin-reply-complaint',
  ADMIN_REPLY_SUPPORT: 'admin-reply-support',
};

export const AUTH_EMAIL_TEMPLATE_SLUGS = [
  EMAIL_TEMPLATE_SLUGS.ADMIN_INVITE,
  EMAIL_TEMPLATE_SLUGS.ADMIN_WELCOME,
  EMAIL_TEMPLATE_SLUGS.ADMIN_FORGOT_PASSWORD,
  EMAIL_TEMPLATE_SLUGS.ADMIN_PASSWORD_CHANGED,
];

export const ADMIN_EMAIL_TEMPLATE_SLUGS = [
  EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_CONTACT,
  EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_DPO,
  EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_COMPLAINT,
  EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_SUPPORT,
];

export function weatherAlertTemplateSlug(alertTypeId) {
  return `${EMAIL_TEMPLATE_SLUGS.WEATHER_ALERT}-${alertTypeId}`;
}

/**
 * Prefer per-alert-type template; fall back to shared weather-alert.
 * @param {string} [alertTypeId]
 */
export function resolveWeatherAlertTemplateSlug(alertTypeId) {
  if (!alertTypeId) {
    return EMAIL_TEMPLATE_SLUGS.WEATHER_ALERT;
  }

  if (ALL_ALERT_TYPES.some((type) => type.id === alertTypeId)) {
    return weatherAlertTemplateSlug(alertTypeId);
  }

  return EMAIL_TEMPLATE_SLUGS.WEATHER_ALERT;
}

export function isAdminReplyTemplateSlug(slug) {
  return ADMIN_EMAIL_TEMPLATE_SLUGS.includes(slug);
}
