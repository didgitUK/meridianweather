import { describe, expect, it } from 'vitest';
import { ADMIN_SECTION_ALIASES, ADMIN_SECTION_IDS, getAdminSection } from '@/constants/admin';

describe('admin email nav', () => {
  it('exposes Email dashboard, lists, templates, and settings', () => {
    expect(getAdminSection(ADMIN_SECTION_IDS.emailDashboard)?.label).toBe('Dashboard');
    expect(getAdminSection(ADMIN_SECTION_IDS.mailingLists)?.label).toBe('Mailing Lists');
    expect(getAdminSection(ADMIN_SECTION_IDS.emailTemplates)?.label).toBe('Email Templates');
    expect(getAdminSection(ADMIN_SECTION_IDS.emailSettings)?.label).toBe('Settings');
  });

  it('exposes profile and users sections', () => {
    expect(getAdminSection(ADMIN_SECTION_IDS.profile)?.label).toBe('Profile');
    expect(getAdminSection(ADMIN_SECTION_IDS.users)?.hint).toMatch(/Invite/i);
  });

  it('aliases legacy email and alert subscriber sections', () => {
    expect(ADMIN_SECTION_ALIASES.newsletter).toBe(ADMIN_SECTION_IDS.mailingLists);
    expect(ADMIN_SECTION_ALIASES['weekly-digests']).toBe(ADMIN_SECTION_IDS.mailingLists);
    expect(ADMIN_SECTION_ALIASES['alert-subscribers']).toBe(ADMIN_SECTION_IDS.mailingLists);
    expect(ADMIN_SECTION_ALIASES['weather-alerts']).toBe(ADMIN_SECTION_IDS.mailingLists);
    expect(ADMIN_SECTION_ALIASES['auth-emails']).toBe(ADMIN_SECTION_IDS.emailTemplates);
    expect(ADMIN_SECTION_ALIASES['admin-emails']).toBe(ADMIN_SECTION_IDS.emailTemplates);
  });
});
