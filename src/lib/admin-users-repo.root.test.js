import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { bootstrapAdminUsersFromEnv, getAdminUserByEmail } from '@/lib/admin-users-repo';
import { loginAdminUser } from '@/lib/server/admin-auth';

const PREV = {
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_DISPLAY_NAME: process.env.ADMIN_DISPLAY_NAME,
  ADMIN_SECRET: process.env.ADMIN_SECRET,
};

describe('root admin from env', () => {
  beforeEach(() => {
    process.env.ADMIN_EMAIL = 'root@example.test';
    process.env.ADMIN_PASSWORD = 'RootTestPass_99!';
    process.env.ADMIN_DISPLAY_NAME = 'Root';
    process.env.ADMIN_SECRET = 'test-signing-secret';
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(PREV)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it('ensures root admin exists and accepts master login', () => {
    const seeded = bootstrapAdminUsersFromEnv();
    expect(seeded?.email).toBe('root@example.test');
    expect(seeded?.displayName).toBe('Root');

    const row = getAdminUserByEmail('root@example.test');
    expect(row?.active).toBeTruthy();

    const user = loginAdminUser({
      email: 'root@example.test',
      password: 'RootTestPass_99!',
    });
    expect(user?.email).toBe('root@example.test');
  });
});
