import { ALL_ALERT_TYPES } from '@/constants/alert-types';
import { EMAIL_TEMPLATE_SLUGS } from '@/constants/email-template-slugs';

/** Bump when layout HTML structure changes; used for DB upgrades. */
export const EMAIL_LAYOUT_VERSION = 2;

export const EMAIL_LAYOUT_MARKER = `<!-- meridian-email-layout:${EMAIL_LAYOUT_VERSION} -->`;

/** Accent bands for alert severity / weather groups. */
export const EMAIL_ACCENT = {
  cool: '#2563eb',
  storm: '#4f46e5',
  ice: '#64748b',
  heat: '#ea580c',
  fog: '#94a3b8',
  yellow: '#ca8a04',
  amber: '#d97706',
  red: '#dc2626',
  flood: '#0d9488',
  marine: '#0891b2',
  air: '#65a30d',
  uv: '#f59e0b',
  nws: '#b91c1c',
  brand: '#111111',
  invite: '#1d4ed8',
  auth: '#0f172a',
  support: '#0369a1',
  privacy: '#7c3aed',
  complaint: '#b45309',
};

/**
 * Static Unsplash / brand atmosphere images for non-alert emails.
 * Absolute URLs so clients resolve without app host when previewing.
 */
export const EMAIL_BRAND_IMAGES = {
  welcome:
    'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1200&h=400&q=80',
  digest:
    'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&h=400&q=80',
  invite:
    'https://images.unsplash.com/photo-1496450681664-3df85efbd29f?auto=format&fit=crop&w=1200&h=400&q=80',
  auth:
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&h=400&q=80',
  support:
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&h=400&q=80',
};

/** @typedef {{ eyebrow: string, accentColor: string, leadHtml: string, imageMode: 'hero' | 'brand' | 'none', brandImageKey?: string }} EmailTheme */

/** @type {Record<string, EmailTheme>} */
const ALERT_THEMES_BY_ID = {
  rain: {
    eyebrow: 'Rain alert',
    accentColor: EMAIL_ACCENT.cool,
    leadHtml:
      '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;">Rain is expected in <strong>{{cityName}}</strong>. {{matchLabel}} · {{temperature}}.</p>',
    imageMode: 'hero',
  },
  wind: {
    eyebrow: 'Wind alert',
    accentColor: EMAIL_ACCENT.cool,
    leadHtml:
      '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;">Elevated winds around <strong>{{cityName}}</strong>. {{matchLabel}} · {{temperature}}.</p>',
    imageMode: 'hero',
  },
  thunderstorm: {
    eyebrow: 'Thunderstorm alert',
    accentColor: EMAIL_ACCENT.storm,
    leadHtml:
      '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;">Thunderstorm conditions for <strong>{{cityName}}</strong>. {{matchLabel}} · {{temperature}}.</p>',
    imageMode: 'hero',
  },
  snow: {
    eyebrow: 'Snow alert',
    accentColor: EMAIL_ACCENT.ice,
    leadHtml:
      '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;">Snow is in the picture for <strong>{{cityName}}</strong>. {{matchLabel}} · {{temperature}}.</p>',
    imageMode: 'hero',
  },
  ice: {
    eyebrow: 'Ice alert',
    accentColor: EMAIL_ACCENT.ice,
    leadHtml:
      '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;">Icy conditions may affect <strong>{{cityName}}</strong>. {{matchLabel}} · {{temperature}}.</p>',
    imageMode: 'hero',
  },
  extreme_heat: {
    eyebrow: 'Extreme heat',
    accentColor: EMAIL_ACCENT.heat,
    leadHtml:
      '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;">Extreme heat risk for <strong>{{cityName}}</strong>. {{matchLabel}} · {{temperature}}.</p>',
    imageMode: 'hero',
  },
  fog: {
    eyebrow: 'Fog alert',
    accentColor: EMAIL_ACCENT.fog,
    leadHtml:
      '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;">Reduced visibility near <strong>{{cityName}}</strong>. {{matchLabel}} · {{temperature}}.</p>',
    imageMode: 'hero',
  },
  lightning: {
    eyebrow: 'Lightning alert',
    accentColor: EMAIL_ACCENT.storm,
    leadHtml:
      '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;">Lightning risk around <strong>{{cityName}}</strong>. {{matchLabel}} · {{temperature}}.</p>',
    imageMode: 'hero',
  },
  yellow_warning: {
    eyebrow: 'Yellow warning',
    accentColor: EMAIL_ACCENT.yellow,
    leadHtml:
      '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;">A yellow warning is active for <strong>{{cityName}}</strong>. {{matchLabel}}.</p>',
    imageMode: 'hero',
  },
  amber_warning: {
    eyebrow: 'Amber warning',
    accentColor: EMAIL_ACCENT.amber,
    leadHtml:
      '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;">An amber warning is active for <strong>{{cityName}}</strong>. {{matchLabel}}.</p>',
    imageMode: 'hero',
  },
  red_warning: {
    eyebrow: 'Red warning',
    accentColor: EMAIL_ACCENT.red,
    leadHtml:
      '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;"><strong>Take this seriously.</strong> A red warning covers <strong>{{cityName}}</strong>. {{matchLabel}}.</p>',
    imageMode: 'hero',
  },
  flood_alert: {
    eyebrow: 'Flood alert',
    accentColor: EMAIL_ACCENT.flood,
    leadHtml:
      '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;">Flood alert for <strong>{{cityName}}</strong>. {{matchLabel}} · {{temperature}}.</p>',
    imageMode: 'hero',
  },
  flood_warning: {
    eyebrow: 'Flood warning',
    accentColor: EMAIL_ACCENT.flood,
    leadHtml:
      '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;">Flood warning for <strong>{{cityName}}</strong>. {{matchLabel}} · {{temperature}}.</p>',
    imageMode: 'hero',
  },
  severe_flood_warning: {
    eyebrow: 'Severe flood warning',
    accentColor: EMAIL_ACCENT.red,
    leadHtml:
      '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;"><strong>Severe flood warning</strong> for <strong>{{cityName}}</strong>. {{matchLabel}}.</p>',
    imageMode: 'hero',
  },
  air_quality: {
    eyebrow: 'Air quality',
    accentColor: EMAIL_ACCENT.air,
    leadHtml:
      '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;">Air quality attention for <strong>{{cityName}}</strong>. {{matchLabel}} · {{temperature}}.</p>',
    imageMode: 'hero',
  },
  marine: {
    eyebrow: 'Marine / high surf',
    accentColor: EMAIL_ACCENT.marine,
    leadHtml:
      '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;">Marine or high-surf conditions near <strong>{{cityName}}</strong>. {{matchLabel}}.</p>',
    imageMode: 'hero',
  },
  uv: {
    eyebrow: 'UV / sun',
    accentColor: EMAIL_ACCENT.uv,
    leadHtml:
      '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;">Elevated UV for <strong>{{cityName}}</strong>. {{matchLabel}} · {{temperature}}.</p>',
    imageMode: 'hero',
  },
  tornado_watch: {
    eyebrow: 'Tornado watch',
    accentColor: EMAIL_ACCENT.nws,
    leadHtml:
      '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;"><strong>Tornado watch</strong> — conditions favour tornadoes near <strong>{{cityName}}</strong>. {{matchLabel}}.</p>',
    imageMode: 'hero',
  },
  tornado_warning: {
    eyebrow: 'Tornado warning',
    accentColor: EMAIL_ACCENT.red,
    leadHtml:
      '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;"><strong>Tornado warning</strong> for <strong>{{cityName}}</strong>. {{matchLabel}}. Seek sturdy shelter now.</p>',
    imageMode: 'hero',
  },
  tornado_emergency: {
    eyebrow: 'Tornado emergency',
    accentColor: EMAIL_ACCENT.red,
    leadHtml:
      '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;"><strong>Tornado emergency</strong> for <strong>{{cityName}}</strong>. {{matchLabel}}. This is a life-threatening situation.</p>',
    imageMode: 'hero',
  },
  severe_thunderstorm: {
    eyebrow: 'Severe thunderstorm',
    accentColor: EMAIL_ACCENT.nws,
    leadHtml:
      '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;">Severe thunderstorm for <strong>{{cityName}}</strong>. {{matchLabel}} · {{temperature}}.</p>',
    imageMode: 'hero',
  },
  hurricane: {
    eyebrow: 'Hurricane / tropical',
    accentColor: EMAIL_ACCENT.nws,
    leadHtml:
      '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;">Tropical cyclone attention for <strong>{{cityName}}</strong>. {{matchLabel}}.</p>',
    imageMode: 'hero',
  },
};

const FALLBACK_ALERT_THEME = {
  eyebrow: 'Weather alert',
  accentColor: EMAIL_ACCENT.cool,
  leadHtml:
    '<p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;color:#333333;">{{alertLabel}} for <strong>{{cityName}}</strong>: {{matchLabel}} · {{temperature}} · {{weatherCondition}}</p>',
  imageMode: 'hero',
};

/** @type {Record<string, EmailTheme>} */
export const EMAIL_TEMPLATE_THEMES = {
  [EMAIL_TEMPLATE_SLUGS.WELCOME]: {
    eyebrow: 'Welcome',
    accentColor: EMAIL_ACCENT.brand,
    leadHtml:
      '<p style="margin:0 0 16px 0;font-size:16px;line-height:1.5;color:#333333;">Thanks for joining meridian with <strong>{{email}}</strong>. We send product updates sparingly — your saved cities stay in your browser.</p>',
    imageMode: 'brand',
    brandImageKey: 'welcome',
  },
  [EMAIL_TEMPLATE_SLUGS.WEEKLY_DIGEST]: {
    eyebrow: 'Weekly digest',
    accentColor: EMAIL_ACCENT.cool,
    leadHtml:
      '<p style="margin:0 0 16px 0;font-size:16px;line-height:1.5;color:#333333;">Your weekly snapshot for <strong>{{locationCount}}</strong> location(s): {{locationNames}}.</p>',
    imageMode: 'brand',
    brandImageKey: 'digest',
  },
  [EMAIL_TEMPLATE_SLUGS.WEATHER_ALERT]: FALLBACK_ALERT_THEME,
  [EMAIL_TEMPLATE_SLUGS.ADMIN_INVITE]: {
    eyebrow: 'Admin invite',
    accentColor: EMAIL_ACCENT.invite,
    leadHtml:
      '<p style="margin:0 0 16px 0;font-size:16px;line-height:1.5;color:#333333;">Hello {{displayName}},</p><p style="margin:0 0 16px 0;font-size:16px;line-height:1.5;color:#333333;">{{invitedBy}} invited you to administer meridian.</p>',
    imageMode: 'brand',
    brandImageKey: 'invite',
  },
  [EMAIL_TEMPLATE_SLUGS.ADMIN_WELCOME]: {
    eyebrow: 'Account ready',
    accentColor: EMAIL_ACCENT.auth,
    leadHtml:
      '<p style="margin:0 0 16px 0;font-size:16px;line-height:1.5;color:#333333;">Hello {{displayName}},</p><p style="margin:0 0 16px 0;font-size:16px;line-height:1.5;color:#333333;">Your administrator account for {{email}} is ready.</p>',
    imageMode: 'brand',
    brandImageKey: 'auth',
  },
  [EMAIL_TEMPLATE_SLUGS.ADMIN_FORGOT_PASSWORD]: {
    eyebrow: 'Password reset',
    accentColor: EMAIL_ACCENT.auth,
    leadHtml:
      '<p style="margin:0 0 16px 0;font-size:16px;line-height:1.5;color:#333333;">Hello {{displayName}},</p><p style="margin:0 0 16px 0;font-size:16px;line-height:1.5;color:#333333;">We received a request to reset the password for {{email}}.</p>',
    imageMode: 'brand',
    brandImageKey: 'auth',
  },
  [EMAIL_TEMPLATE_SLUGS.ADMIN_PASSWORD_CHANGED]: {
    eyebrow: 'Password updated',
    accentColor: EMAIL_ACCENT.auth,
    leadHtml:
      '<p style="margin:0 0 16px 0;font-size:16px;line-height:1.5;color:#333333;">Hello {{displayName}},</p><p style="margin:0 0 16px 0;font-size:16px;line-height:1.5;color:#333333;">The password for {{email}} was changed successfully.</p>',
    imageMode: 'brand',
    brandImageKey: 'auth',
  },
  [EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_CONTACT]: {
    eyebrow: 'Contact reply',
    accentColor: EMAIL_ACCENT.support,
    leadHtml:
      '<p style="margin:0 0 16px 0;font-size:16px;line-height:1.5;color:#333333;">Hello {{recipientName}},</p><p style="margin:0 0 16px 0;font-size:16px;line-height:1.5;color:#333333;">Thanks for getting in touch. We have received your message and will follow up as needed.</p>',
    imageMode: 'brand',
    brandImageKey: 'support',
  },
  [EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_DPO]: {
    eyebrow: 'Data protection',
    accentColor: EMAIL_ACCENT.privacy,
    leadHtml:
      '<p style="margin:0 0 16px 0;font-size:16px;line-height:1.5;color:#333333;">Hello {{recipientName}},</p><p style="margin:0 0 16px 0;font-size:16px;line-height:1.5;color:#333333;">Thank you for your data protection request. We are reviewing it and will respond within the applicable timeframe.</p>',
    imageMode: 'brand',
    brandImageKey: 'support',
  },
  [EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_COMPLAINT]: {
    eyebrow: 'Complaint acknowledgement',
    accentColor: EMAIL_ACCENT.complaint,
    leadHtml:
      '<p style="margin:0 0 16px 0;font-size:16px;line-height:1.5;color:#333333;">Hello {{recipientName}},</p><p style="margin:0 0 16px 0;font-size:16px;line-height:1.5;color:#333333;">We have received your complaint and take it seriously. A member of the team will review the details and respond.</p>',
    imageMode: 'brand',
    brandImageKey: 'support',
  },
  [EMAIL_TEMPLATE_SLUGS.ADMIN_REPLY_SUPPORT]: {
    eyebrow: 'Support update',
    accentColor: EMAIL_ACCENT.support,
    leadHtml:
      '<p style="margin:0 0 16px 0;font-size:16px;line-height:1.5;color:#333333;">Hello {{recipientName}},</p><p style="margin:0 0 16px 0;font-size:16px;line-height:1.5;color:#333333;">Thanks for contacting support. Here is an update regarding your request.</p>',
    imageMode: 'brand',
    brandImageKey: 'support',
  },
};

for (const type of ALL_ALERT_TYPES) {
  EMAIL_TEMPLATE_THEMES[`${EMAIL_TEMPLATE_SLUGS.WEATHER_ALERT}-${type.id}`] =
    ALERT_THEMES_BY_ID[type.id] ?? {
      ...FALLBACK_ALERT_THEME,
      eyebrow: type.label,
    };
}

/**
 * @param {string} slug
 * @returns {EmailTheme}
 */
export function getEmailTemplateTheme(slug) {
  return EMAIL_TEMPLATE_THEMES[slug] ?? {
    eyebrow: 'meridian',
    accentColor: EMAIL_ACCENT.brand,
    leadHtml: '',
    imageMode: 'none',
  };
}

/**
 * @param {{ id?: string, label?: string } | null | undefined} alertType
 * @returns {EmailTheme}
 */
export function getAlertEmailTheme(alertType) {
  if (!alertType?.id) {
    return FALLBACK_ALERT_THEME;
  }
  return ALERT_THEMES_BY_ID[alertType.id] ?? {
    ...FALLBACK_ALERT_THEME,
    eyebrow: alertType.label ?? 'Weather alert',
  };
}
