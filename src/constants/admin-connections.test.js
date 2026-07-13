import { describe, expect, it } from 'vitest';
import { ADMIN_SECTION_IDS } from './admin.js';
import {
  ADMIN_CONNECTION_CHECK_MODE,
  ADMIN_CONNECTION_KIND,
  ADMIN_CONNECTION_STATUS,
  ADMIN_CONNECTIONS,
  ADMIN_CONNECTION_STATUS_LABEL,
  getAdminConnectionSectionId,
  getAdminConnectionActionLabel,
  isAdminConnectionReady,
} from './admin-connections.js';

describe('admin-connections constants', () => {
  it('defines weather, adsense, and email group with expected check modes', () => {
    expect(
      ADMIN_CONNECTIONS.map((item) => ({
        id: item.id,
        kind: item.kind,
        checkMode: item.checkMode,
      })),
    ).toEqual([
      {
        id: 'weather',
        kind: ADMIN_CONNECTION_KIND.ITEM,
        checkMode: ADMIN_CONNECTION_CHECK_MODE.LIVE,
      },
      {
        id: 'adsense',
        kind: ADMIN_CONNECTION_KIND.ITEM,
        checkMode: ADMIN_CONNECTION_CHECK_MODE.LIVE,
      },
      {
        id: 'email',
        kind: ADMIN_CONNECTION_KIND.GROUP,
        checkMode: ADMIN_CONNECTION_CHECK_MODE.CONFIG,
      },
    ]);
  });

  it('labels every status', () => {
    for (const status of Object.values(ADMIN_CONNECTION_STATUS)) {
      expect(ADMIN_CONNECTION_STATUS_LABEL[status]).toBeTruthy();
    }
  });

  it('maps connection rows to admin connector sections', () => {
    expect(getAdminConnectionSectionId('weather')).toBe(ADMIN_SECTION_IDS.weatherApi);
    expect(getAdminConnectionSectionId('adsense')).toBe(ADMIN_SECTION_IDS.adsense);
    expect(getAdminConnectionSectionId('email-resend')).toBe(ADMIN_SECTION_IDS.emailConnectors);
    expect(getAdminConnectionSectionId('email-sendgrid')).toBe(ADMIN_SECTION_IDS.emailConnectors);
    expect(getAdminConnectionSectionId('email-ses')).toBe(ADMIN_SECTION_IDS.emailConnectors);
    expect(getAdminConnectionSectionId('unknown')).toBeNull();
  });

  it('labels Connect vs View from connection readiness', () => {
    expect(isAdminConnectionReady(ADMIN_CONNECTION_STATUS.CONNECTED)).toBe(true);
    expect(isAdminConnectionReady(ADMIN_CONNECTION_STATUS.NOT_CONFIGURED)).toBe(false);
    expect(getAdminConnectionActionLabel(ADMIN_CONNECTION_STATUS.NOT_CONFIGURED)).toBe('Connect >');
    expect(getAdminConnectionActionLabel(ADMIN_CONNECTION_STATUS.ERROR)).toBe('Connect >');
    expect(getAdminConnectionActionLabel(ADMIN_CONNECTION_STATUS.CONNECTED)).toBe('View >');
    expect(getAdminConnectionActionLabel(ADMIN_CONNECTION_STATUS.CONFIGURED)).toBe('View >');
    expect(getAdminConnectionActionLabel(ADMIN_CONNECTION_STATUS.ACTIVE)).toBe('View >');
  });
});
