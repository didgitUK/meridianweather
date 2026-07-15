import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { sendMail, createTransport } = vi.hoisted(() => {
  const sendMail = vi.fn();
  const createTransport = vi.fn(() => ({ sendMail }));
  return { sendMail, createTransport };
});

const settingsState = {
  emailProvider: 'none',
  resendApiKey: '',
  resendFromEmail: '',
  resendAudienceId: '',
  sendgridApiKey: '',
  sendgridFromEmail: '',
  sendgridListId: '',
  sesAccessKeyId: '',
  sesSecretAccessKey: '',
  sesRegion: 'eu-west-1',
  sesFromEmail: '',
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPassword: '',
  smtpFromEmail: '',
  smtpSecure: false,
  emailLastSyncedAt: null,
};

vi.mock('@/lib/platform-settings', () => ({
  getPlatformSettings: () => settingsState,
}));

vi.mock('nodemailer', () => ({
  default: { createTransport },
}));

vi.mock('resend', () => ({
  Resend: vi.fn(() => ({
    emails: { send: vi.fn() },
  })),
}));

const fetchMock = vi.fn();

import { EMAIL_PROVIDERS } from '@/constants/email-providers';
import { sendTransactionalEmail } from './email-provider.js';

describe('sendTransactionalEmail', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
    sendMail.mockReset();
    createTransport.mockClear();
    sendMail.mockResolvedValue({ messageId: 'smtp-test-id' });
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '',
    });
  });

  afterEach(() => {
    settingsState.emailProvider = 'none';
    settingsState.sesAccessKeyId = '';
    settingsState.sesSecretAccessKey = '';
    settingsState.sesFromEmail = '';
    settingsState.smtpHost = '';
    settingsState.smtpPassword = '';
    settingsState.smtpFromEmail = '';
    settingsState.smtpUser = '';
    settingsState.smtpPort = 587;
    settingsState.smtpSecure = false;
    vi.unstubAllGlobals();
  });

  it('sends via SES when connector is configured', async () => {
    settingsState.emailProvider = EMAIL_PROVIDERS.ses;
    settingsState.sesAccessKeyId = 'AKIAEXAMPLE';
    settingsState.sesSecretAccessKey = 'secret-example-value';
    settingsState.sesFromEmail = 'alerts@example.com';
    settingsState.sesRegion = 'eu-west-1';

    const result = await sendTransactionalEmail({
      to: 'user@example.com',
      subject: 'Test subject',
      html: '<p>Hello</p>',
    });

    expect(result).toEqual({ sent: true, provider: EMAIL_PROVIDERS.ses });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://email.eu-west-1.amazonaws.com/v2/email/outbound-emails');
    expect(options.method).toBe('POST');
    expect(options.headers.Authorization).toMatch(/^AWS4-HMAC-SHA256 Credential=AKIAEXAMPLE\//);
    expect(options.headers['x-amz-date']).toBeTruthy();

    const body = JSON.parse(options.body);
    expect(body.FromEmailAddress).toBe('alerts@example.com');
    expect(body.Destination.ToAddresses).toEqual(['user@example.com']);
    expect(body.Content.Simple.Subject.Data).toBe('Test subject');
    expect(body.Content.Simple.Body.Html.Data).toBe('<p>Hello</p>');
  });

  it('throws when SES responds with an error', async () => {
    settingsState.emailProvider = EMAIL_PROVIDERS.ses;
    settingsState.sesAccessKeyId = 'AKIAEXAMPLE';
    settingsState.sesSecretAccessKey = 'secret-example-value';
    settingsState.sesFromEmail = 'alerts@example.com';

    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => 'MessageRejected',
    });

    await expect(
      sendTransactionalEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Hi</p>',
      }),
    ).rejects.toThrow('MessageRejected');
  });

  it('sends via SMTP when connector is configured', async () => {
    settingsState.emailProvider = EMAIL_PROVIDERS.smtp;
    settingsState.smtpHost = 'smtp.example.com';
    settingsState.smtpPassword = 'smtp-secret';
    settingsState.smtpFromEmail = 'alerts@example.com';
    settingsState.smtpUser = 'smtp-user';
    settingsState.smtpPort = 465;
    settingsState.smtpSecure = true;

    const result = await sendTransactionalEmail({
      to: 'user@example.com',
      subject: 'SMTP test',
      html: '<p>SMTP body</p>',
    });

    expect(result).toEqual({ sent: true, provider: EMAIL_PROVIDERS.smtp });
    expect(createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 465,
      secure: true,
      auth: { user: 'smtp-user', pass: 'smtp-secret' },
    });
    expect(sendMail).toHaveBeenCalledWith({
      from: 'alerts@example.com',
      to: 'user@example.com',
      subject: 'SMTP test',
      html: '<p>SMTP body</p>',
    });
  });

  it('sends via SMTP without auth when user is empty', async () => {
    settingsState.emailProvider = EMAIL_PROVIDERS.smtp;
    settingsState.smtpHost = 'smtp.example.com';
    settingsState.smtpPassword = 'smtp-secret';
    settingsState.smtpFromEmail = 'alerts@example.com';
    settingsState.smtpUser = '';

    await sendTransactionalEmail({
      to: 'user@example.com',
      subject: 'No auth',
      html: '<p>Hi</p>',
    });

    expect(createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: undefined,
    });
  });

  it('returns not configured when SES credentials are missing', async () => {
    settingsState.emailProvider = EMAIL_PROVIDERS.ses;
    settingsState.sesFromEmail = 'alerts@example.com';

    const result = await sendTransactionalEmail({
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    });

    expect(result).toEqual({ sent: false, reason: 'email_not_configured' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns not configured when SMTP credentials are missing', async () => {
    settingsState.emailProvider = EMAIL_PROVIDERS.smtp;
    settingsState.smtpFromEmail = 'alerts@example.com';

    const result = await sendTransactionalEmail({
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    });

    expect(result).toEqual({ sent: false, reason: 'email_not_configured' });
    expect(createTransport).not.toHaveBeenCalled();
  });
});
