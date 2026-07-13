import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SES_REGION,
  EMAIL_PROVIDERS,
  EMAIL_PROVIDER_OPTIONS,
} from './email-providers.js';

describe('email-providers constants', () => {
  it('includes resend, sendgrid, and ses', () => {
    expect(EMAIL_PROVIDERS).toEqual({
      resend: 'resend',
      sendgrid: 'sendgrid',
      ses: 'ses',
    });

    expect(EMAIL_PROVIDER_OPTIONS.map((option) => option.id)).toEqual([
      'resend',
      'sendgrid',
      'ses',
    ]);
  });

  it('defaults SES region to eu-west-1', () => {
    expect(DEFAULT_SES_REGION).toBe('eu-west-1');
  });
});
