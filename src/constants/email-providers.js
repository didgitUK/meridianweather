/** Shared email connector provider definitions for admin UI + server. */

export const EMAIL_PROVIDERS = {
  resend: 'resend',
  sendgrid: 'sendgrid',
  ses: 'ses',
};

export const EMAIL_PROVIDER_OPTIONS = [
  { id: EMAIL_PROVIDERS.resend, label: 'Resend' },
  { id: EMAIL_PROVIDERS.sendgrid, label: 'SendGrid' },
  { id: EMAIL_PROVIDERS.ses, label: 'Amazon SES' },
];

export const DEFAULT_SES_REGION = 'eu-west-1';
