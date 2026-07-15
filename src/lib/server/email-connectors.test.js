import { afterEach, describe, expect, it, vi } from 'vitest';

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

vi.mock('@/lib/admin-audit-repo', () => ({
  getRecentAdminAuditEvents: () => [],
}));

import {
  EMAIL_PROVIDERS,
  getEmailConnectorsAdminConfig,
  getEmailProviderConnectionSnapshots,
  isEmailConfigured,
  resolveActiveEmailConnector,
} from './email-connectors.js';

describe('email-connectors', () => {
  afterEach(() => {
    settingsState.emailProvider = 'none';
    settingsState.resendApiKey = '';
    settingsState.sendgridApiKey = '';
    settingsState.sesAccessKeyId = '';
    settingsState.sesSecretAccessKey = '';
    settingsState.sesFromEmail = '';
    settingsState.smtpHost = '';
    settingsState.smtpPassword = '';
    settingsState.smtpFromEmail = '';
    settingsState.smtpUser = '';
    settingsState.smtpPort = 587;
    settingsState.smtpSecure = false;
    delete process.env.RESEND_API_KEY;
    delete process.env.SENDGRID_API_KEY;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.AWS_SES_FROM_EMAIL;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PASSWORD;
    delete process.env.SMTP_FROM_EMAIL;
  });

  it('resolves SES when selected and credentials are present', () => {
    settingsState.emailProvider = EMAIL_PROVIDERS.ses;
    settingsState.sesAccessKeyId = 'AKIAEXAMPLE';
    settingsState.sesSecretAccessKey = 'secret-example-value';
    settingsState.sesFromEmail = 'alerts@example.com';

    const connector = resolveActiveEmailConnector();

    expect(connector.provider).toBe(EMAIL_PROVIDERS.ses);
    expect(connector.accessKeyId).toBe('AKIAEXAMPLE');
    expect(connector.apiKey).toBe('secret-example-value');
    expect(isEmailConfigured()).toBe(true);
  });

  it('treats SES as not configured without access key', () => {
    settingsState.emailProvider = EMAIL_PROVIDERS.ses;
    settingsState.sesSecretAccessKey = 'secret-example-value';
    settingsState.sesFromEmail = 'alerts@example.com';

    expect(isEmailConfigured()).toBe(false);
  });

  it('resolves SMTP when selected and credentials are present', () => {
    settingsState.emailProvider = EMAIL_PROVIDERS.smtp;
    settingsState.smtpHost = 'smtp.example.com';
    settingsState.smtpPassword = 'smtp-secret';
    settingsState.smtpFromEmail = 'alerts@example.com';
    settingsState.smtpPort = 465;
    settingsState.smtpSecure = true;

    const connector = resolveActiveEmailConnector();

    expect(connector.provider).toBe(EMAIL_PROVIDERS.smtp);
    expect(connector.host).toBe('smtp.example.com');
    expect(connector.apiKey).toBe('smtp-secret');
    expect(connector.port).toBe(465);
    expect(connector.secure).toBe(true);
    expect(isEmailConfigured()).toBe(true);
  });

  it('treats SMTP as not configured without host', () => {
    settingsState.emailProvider = EMAIL_PROVIDERS.smtp;
    settingsState.smtpPassword = 'smtp-secret';
    settingsState.smtpFromEmail = 'alerts@example.com';

    expect(isEmailConfigured()).toBe(false);
  });

  it('treats none as disconnected', () => {
    settingsState.emailProvider = EMAIL_PROVIDERS.none;
    settingsState.resendApiKey = 're-key';

    expect(resolveActiveEmailConnector().provider).toBe(EMAIL_PROVIDERS.none);
    expect(isEmailConfigured()).toBe(false);

    const snapshots = getEmailProviderConnectionSnapshots();
    expect(snapshots.every((item) => item.active === false)).toBe(true);
  });

  it('exposes four provider snapshots for sidebar status', () => {
    settingsState.emailProvider = EMAIL_PROVIDERS.sendgrid;
    settingsState.sendgridApiKey = 'sg-key';
    settingsState.resendApiKey = 're-key';

    const snapshots = getEmailProviderConnectionSnapshots();

    expect(snapshots).toHaveLength(4);
    expect(snapshots.map((item) => item.providerId)).toEqual([
      'resend',
      'sendgrid',
      'ses',
      'smtp',
    ]);
    expect(snapshots.find((item) => item.providerId === 'sendgrid')).toMatchObject({
      active: true,
      configured: true,
    });
    expect(snapshots.find((item) => item.providerId === 'resend')).toMatchObject({
      active: false,
      configured: true,
    });
    expect(snapshots.find((item) => item.providerId === 'ses')).toMatchObject({
      active: false,
      configured: false,
    });
    expect(snapshots.find((item) => item.providerId === 'smtp')).toMatchObject({
      active: false,
      configured: false,
    });
  });

  it('includes smtp in admin config', () => {
    const config = getEmailConnectorsAdminConfig();
    expect(config.smtp).toBeTruthy();
    expect(config.providers.map((item) => item.id)).toEqual([
      'resend',
      'sendgrid',
      'ses',
      'smtp',
    ]);
  });

  it('marks SES and SMTP configured when required fields are present', () => {
    settingsState.sesAccessKeyId = 'AKIAEXAMPLE';
    settingsState.sesSecretAccessKey = 'secret-example-value';
    settingsState.sesFromEmail = 'alerts@example.com';
    settingsState.smtpHost = 'smtp.example.com';
    settingsState.smtpPassword = 'smtp-secret';
    settingsState.smtpFromEmail = 'alerts@example.com';

    const config = getEmailConnectorsAdminConfig();

    expect(config.ses).toMatchObject({
      configured: true,
      accessKeyIdConfigured: true,
      secretConfigured: true,
      fromEmail: 'alerts@example.com',
    });
    expect(config.smtp).toMatchObject({
      configured: true,
      secretConfigured: true,
      host: 'smtp.example.com',
      fromEmail: 'alerts@example.com',
    });
  });
});
