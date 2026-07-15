import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SES_REGION,
  DEFAULT_SMTP_PORT,
  EMAIL_PROVIDERS,
  EMAIL_PROVIDER_OPTIONS,
  isActivatableEmailProvider,
} from './email-providers.js';

describe('email-providers constants', () => {
  it('includes none plus four activatable connectors', () => {
    expect(EMAIL_PROVIDERS).toEqual({
      none: 'none',
      resend: 'resend',
      sendgrid: 'sendgrid',
      ses: 'ses',
      smtp: 'smtp',
    });

    expect(EMAIL_PROVIDER_OPTIONS.map((option) => option.id)).toEqual([
      'resend',
      'sendgrid',
      'ses',
      'smtp',
    ]);
  });

  it('treats only the four connectors as activatable', () => {
    expect(isActivatableEmailProvider(EMAIL_PROVIDERS.resend)).toBe(true);
    expect(isActivatableEmailProvider(EMAIL_PROVIDERS.none)).toBe(false);
  });

  it('defaults SES region to eu-west-1', () => {
    expect(DEFAULT_SES_REGION).toBe('eu-west-1');
  });

  it('defaults SMTP port to 587', () => {
    expect(DEFAULT_SMTP_PORT).toBe(587);
  });
});
