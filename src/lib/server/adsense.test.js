import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/platform-settings', () => ({
  getPlatformSettings: () => ({
    adsenseClientId: '',
    adsenseSlotDashboard: '',
    adsenseEnabled: true,
  }),
}));

import {
  getAdSenseClientId,
  getAdSensePublisherId,
  getAdSenseSlotForPlacement,
  isAdSenseConfigured,
} from './adsense';

const PLACEMENTS = ['dashboard', 'hero', 'recent-checks'];

describe('adsense server config', () => {
  afterEach(() => {
    delete process.env.GOOGLE_ADSENSE_CLIENT_ID;
    delete process.env.GOOGLE_ADSENSE_SLOT_DASHBOARD;
  });

  it('accepts a valid client id', () => {
    process.env.GOOGLE_ADSENSE_CLIENT_ID = 'ca-pub-2983984988419906';

    expect(getAdSenseClientId()).toBe('ca-pub-2983984988419906');
    expect(getAdSensePublisherId()).toBe('pub-2983984988419906');
    expect(isAdSenseConfigured()).toBe(true);
  });

  it('rejects malformed client ids', () => {
    process.env.GOOGLE_ADSENSE_CLIENT_ID = 'not-a-publisher-id';

    expect(getAdSenseClientId()).toBe('');
    expect(isAdSenseConfigured()).toBe(false);
  });

  it('returns slot ids only when numeric', () => {
    process.env.GOOGLE_ADSENSE_SLOT_DASHBOARD = '1234567890';

    expect(getAdSenseSlotForPlacement('dashboard', PLACEMENTS)).toBe('1234567890');
    expect(getAdSenseSlotForPlacement('hero', PLACEMENTS)).toBe('');
  });
});
