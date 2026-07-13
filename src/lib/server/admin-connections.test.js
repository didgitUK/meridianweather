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

import { getAdminConnectionStatuses } from './admin-connections.js';
import { ADMIN_CONNECTION_KIND, ADMIN_CONNECTION_STATUS } from '@/constants/admin-connections';

describe('getAdminConnectionStatuses', () => {
  it('returns email as a group with three provider children', async () => {
    const payload = await getAdminConnectionStatuses({ force: true });
    const email = payload.connections.find((item) => item.id === 'email');

    expect(email.kind).toBe(ADMIN_CONNECTION_KIND.GROUP);
    expect(email.children).toHaveLength(3);
    expect(email.children.map((child) => child.providerId)).toEqual([
      'resend',
      'sendgrid',
      'ses',
    ]);
    expect(email.children.find((child) => child.providerId === 'resend')).toMatchObject({
      active: true,
      status: ADMIN_CONNECTION_STATUS.ACTIVE,
    });
    expect(email.children.find((child) => child.providerId === 'ses')).toMatchObject({
      active: false,
      status: ADMIN_CONNECTION_STATUS.NOT_CONFIGURED,
    });
  });
});
