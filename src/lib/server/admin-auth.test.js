import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createAdminSessionToken,
  parseAdminSessionToken,
  getAdminSessionFromRequest,
} from '@/lib/server/admin-auth';

vi.mock('@/lib/admin-users-repo', () => ({
  authenticateAdminUser: vi.fn(),
  bootstrapAdminUsersFromEnv: vi.fn(),
  countAdminUsers: vi.fn(() => 1),
  getAdminUserById: vi.fn((id) =>
    id === 'user-1'
      ? {
          id: 'user-1',
          email: 'admin@example.com',
          display_name: 'Admin',
          active: 1,
          session_version: 2,
          created_at: null,
          updated_at: null,
          last_login_at: null,
        }
      : null,
  ),
  publicAdminUser: (row) => ({
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    active: Boolean(row.active),
    sessionVersion: row.session_version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at,
  }),
  updateAdminUserPassword: vi.fn(),
}));

describe('admin-auth sessions', () => {
  const previousSecret = process.env.ADMIN_SECRET;
  const previousNodeEnv = process.env.NODE_ENV;
  const previousBypass = process.env.ALLOW_DEV_ADMIN_BYPASS;

  afterEach(() => {
    if (previousSecret === undefined) delete process.env.ADMIN_SECRET;
    else process.env.ADMIN_SECRET = previousSecret;
    process.env.NODE_ENV = previousNodeEnv;
    if (previousBypass === undefined) delete process.env.ALLOW_DEV_ADMIN_BYPASS;
    else process.env.ALLOW_DEV_ADMIN_BYPASS = previousBypass;
  });

  it('rejects legacy null-sub session payloads', () => {
    process.env.ADMIN_SECRET = 'test-admin-secret';
    process.env.NODE_ENV = 'test';
    delete process.env.ALLOW_DEV_ADMIN_BYPASS;

    const token = createAdminSessionToken({
      id: null,
      email: 'root@localhost',
      displayName: 'Root',
      sessionVersion: 0,
    });
    const parsed = parseAdminSessionToken(token);
    expect(parsed.sub).toBeNull();

    const request = {
      cookies: {
        get: () => ({ value: token }),
      },
    };
    expect(getAdminSessionFromRequest(request).authenticated).toBe(false);
  });

  it('accepts versioned user sessions', () => {
    process.env.ADMIN_SECRET = 'test-admin-secret';
    process.env.NODE_ENV = 'test';
    delete process.env.ALLOW_DEV_ADMIN_BYPASS;

    const token = createAdminSessionToken({
      id: 'user-1',
      email: 'admin@example.com',
      displayName: 'Admin',
      sessionVersion: 2,
    });
    const request = {
      cookies: {
        get: () => ({ value: token }),
      },
    };
    const session = getAdminSessionFromRequest(request);
    expect(session.authenticated).toBe(true);
    expect(session.user.id).toBe('user-1');
  });
});
