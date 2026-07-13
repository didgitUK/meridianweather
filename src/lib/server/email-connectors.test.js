import { afterEach, describe, expect, it, vi } from 'vitest';

const settingsState = {
  emailProvider: 'resend',
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
    settingsState.emailProvider = 'resend';
    settingsState.resendApiKey = '';
    settingsState.sendgridApiKey = '';
    settingsState.sesAccessKeyId = '';
    settingsState.sesSecretAccessKey = '';
    settingsState.sesFromEmail = '';
    delete process.env.RESEND_API_KEY;
    delete process.env.SENDGRID_API_KEY;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.AWS_SES_FROM_EMAIL;
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

  it('exposes three provider snapshots for sidebar status', () => {
    settingsState.emailProvider = EMAIL_PROVIDERS.sendgrid;
    settingsState.sendgridApiKey = 'sg-key';
    settingsState.resendApiKey = 're-key';

    const snapshots = getEmailProviderConnectionSnapshots();

    expect(snapshots).toHaveLength(3);
    expect(snapshots.map((item) => item.providerId)).toEqual([
      'resend',
      'sendgrid',
      'ses',
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
  });

  it('includes ses in admin config', () => {
    const config = getEmailConnectorsAdminConfig();
    expect(config.ses).toBeTruthy();
    expect(config.providers.map((item) => item.id)).toEqual([
      'resend',
      'sendgrid',
      'ses',
    ]);
  });
});
