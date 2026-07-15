/** Shared email connector provider definitions for admin UI + server. */

export const EMAIL_PROVIDERS = {
  none: 'none',
  resend: 'resend',
  sendgrid: 'sendgrid',
  ses: 'ses',
  smtp: 'smtp',
};

/** Providers that can be activated (excludes none). */
export const EMAIL_PROVIDER_OPTIONS = [
  {
    id: EMAIL_PROVIDERS.resend,
    label: 'Resend',
    description: 'API-based transactional email with optional Audience sync.',
  },
  {
    id: EMAIL_PROVIDERS.sendgrid,
    label: 'SendGrid',
    description: 'SendGrid mail send with optional Marketing list sync.',
  },
  {
    id: EMAIL_PROVIDERS.ses,
    label: 'Amazon SES',
    description: 'AWS Simple Email Service with access keys and region.',
  },
  {
    id: EMAIL_PROVIDERS.smtp,
    label: 'Custom SMTP',
    description: 'Any outgoing SMTP server (host, port, username, password).',
  },
];

export const DEFAULT_SES_REGION = 'eu-west-1';
export const DEFAULT_SMTP_PORT = 587;

export function isActivatableEmailProvider(providerId) {
  return EMAIL_PROVIDER_OPTIONS.some((option) => option.id === providerId);
}
