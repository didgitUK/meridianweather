import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/platform-settings', () => ({
  getPlatformSettings: () => ({
    openWeatherApiKey: '',
    emailProvider: 'resend',
    resendApiKey: 're_test',
    resendFromEmail: 'alerts@example.com',
    resendAudienceId: '',
    sendgridApiKey: '',
    sendgridFromEmail: '',
    sendgridListId: '',
    sesAccessKeyId: '',
    sesSecretAccessKey: '',
    sesRegion: 'eu-west-1',
    sesFromEmail: '',
    emailLastSyncedAt: null,
    adsenseEnabled: true,
    adsenseClientId: '',
    adsenseSlotDashboard: '',
    openMeteoAlertsEnabled: true,
    nwsAlertsEnabled: true,
  }),
}));

vi.mock('@/lib/api-client', () => ({
  ApiError: class ApiError extends Error {},
  getApiKey: () => {
    throw new Error('not configured');
  },
  fetchOpenWeather: vi.fn(),
}));

vi.mock('@/lib/server/adsense', () => ({
  getAdSenseAdminConfig: () => ({
    adsenseEnabled: true,
    effectiveClientId: 'ca-pub-123',
  }),
}));

vi.mock('@/lib/server/adsense-management', () => ({
  getAdSenseReportingAdminConfig: () => ({
    connected: false,
    oauthEnvConfigured: false,
  }),
  probeAdSenseConnection: vi.fn(),
}));

vi.mock('@/lib/admin-audit-repo', () => ({
  getRecentAdminAuditEvents: () => [],
}));

vi.stubGlobal(
  'fetch',
  vi.fn(async (input) => {
    const url = String(input);
    if (url.includes('api.open-meteo.com') && url.includes('/warnings')) {
      return {
        ok: false,
        status: 404,
        json: async () => ({ reason: 'Not Found', error: true }),
      };
    }

    return {
      ok: true,
      status: 200,
      json: async () => ({ warnings: [], features: [] }),
    };
  }),
);

import { getAdminConnectionStatuses } from './admin-connections.js';
import { ADMIN_CONNECTION_KIND, ADMIN_CONNECTION_STATUS } from '@/constants/admin-connections';

describe('getAdminConnectionStatuses', () => {
  it('returns email as a group with four provider children', async () => {
    const payload = await getAdminConnectionStatuses({ force: true });
    const email = payload.connections.find((item) => item.id === 'email');

    expect(email.kind).toBe(ADMIN_CONNECTION_KIND.GROUP);
    expect(email.children).toHaveLength(4);
    expect(email.children.map((child) => child.providerId)).toEqual([
      'resend',
      'sendgrid',
      'ses',
      'smtp',
    ]);
    expect(email.children.find((child) => child.providerId === 'resend')).toMatchObject({
      active: true,
      status: ADMIN_CONNECTION_STATUS.ACTIVE,
    });
    expect(email.children.find((child) => child.providerId === 'ses')).toMatchObject({
      active: false,
      status: ADMIN_CONNECTION_STATUS.NOT_CONFIGURED,
    });
    expect(email.children.find((child) => child.providerId === 'smtp')).toMatchObject({
      active: false,
      status: ADMIN_CONNECTION_STATUS.NOT_CONFIGURED,
    });
  });

  it('marks Open-Meteo warnings PENDING on upstream 404 while NWS stays reachable', async () => {
    const payload = await getAdminConnectionStatuses({ force: true });
    const alertFeeds = payload.connections.find((item) => item.id === 'alert-feeds');

    expect(alertFeeds.kind).toBe(ADMIN_CONNECTION_KIND.GROUP);
    expect(alertFeeds.children).toHaveLength(2);
    expect(alertFeeds.children.map((child) => child.id)).toEqual(['open-meteo', 'nws']);
    expect(alertFeeds.children.find((child) => child.id === 'open-meteo')).toMatchObject({
      status: ADMIN_CONNECTION_STATUS.PENDING,
    });
    expect(alertFeeds.children.find((child) => child.id === 'nws')).toMatchObject({
      status: ADMIN_CONNECTION_STATUS.CONNECTED,
    });
  });
});
