import { afterEach, describe, expect, it } from 'vitest';
import {
  createAdminInvite,
  createAuthToken,
  getInviteByToken,
  listPendingAdminInvites,
  markInviteAccepted,
  revokeAdminInvite,
  revokePendingInvitesForEmail,
} from '@/lib/admin-invites-repo';
import {
  createAdminPasswordReset,
  getPasswordResetByToken,
  markPasswordResetUsed,
} from '@/lib/admin-password-resets-repo';
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUserByEmail,
} from '@/lib/admin-users-repo';

const testEmail = `invite-${Date.now()}@example.test`;

describe('admin invites', () => {
  afterEach(() => {
    revokePendingInvitesForEmail(testEmail);
    const existing = getAdminUserByEmail(testEmail);
    if (existing) {
      deleteAdminUser(existing.id);
    }
  });

  it('creates a pending invite resolvable by token and rejects reuse after accept', () => {
    const token = createAuthToken();
    const { invite } = createAdminInvite({
      email: testEmail,
      displayName: 'Invitee',
      invitedBy: 'tester',
      token,
    });

    expect(invite.email).toBe(testEmail);
    expect(listPendingAdminInvites().some((item) => item.id === invite.id)).toBe(true);

    const row = getInviteByToken(token);
    expect(row?.email).toBe(testEmail);
    expect(row?.accepted_at).toBeNull();
    expect(new Date(row.expires_at).getTime()).toBeGreaterThan(Date.now());

    markInviteAccepted(invite.id);
    const accepted = getInviteByToken(token);
    expect(accepted?.accepted_at).toBeTruthy();
  });

  it('revokes pending invites', () => {
    const token = createAuthToken();
    const { invite } = createAdminInvite({
      email: testEmail,
      displayName: 'Invitee',
      token,
    });

    expect(revokeAdminInvite(invite.id)).toBe(true);
    expect(getInviteByToken(token)).toBeNull();
  });
});

describe('admin password resets', () => {
  afterEach(() => {
    const existing = getAdminUserByEmail(testEmail);
    if (existing) {
      deleteAdminUser(existing.id);
    }
  });

  it('creates a single-use reset token for a user', () => {
    const user = createAdminUser({
      email: testEmail,
      displayName: 'Reset User',
      password: 'TempPass_123!',
    });

    const reset = createAdminPasswordReset({ userId: user.id });
    const row = getPasswordResetByToken(reset.token);
    expect(row?.user_id).toBe(user.id);
    expect(row?.used_at).toBeNull();

    markPasswordResetUsed(reset.id);
    const used = getPasswordResetByToken(reset.token);
    expect(used?.used_at).toBeTruthy();
  });
});
