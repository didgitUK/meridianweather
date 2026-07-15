import { afterEach, describe, expect, it } from 'vitest';
import { isCronRequestAuthorized } from './cron-auth';

function requestWithAuth(authorization) {
  return {
    headers: {
      get(name) {
        if (name.toLowerCase() === 'authorization') {
          return authorization ?? null;
        }
        return null;
      },
    },
  };
}

describe('cron-auth', () => {
  const prevSecret = process.env.CRON_SECRET;
  const prevEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (prevSecret === undefined) {
      delete process.env.CRON_SECRET;
    } else {
      process.env.CRON_SECRET = prevSecret;
    }
    process.env.NODE_ENV = prevEnv;
  });

  it('denies when CRON_SECRET is unset in production', () => {
    delete process.env.CRON_SECRET;
    process.env.NODE_ENV = 'production';
    expect(isCronRequestAuthorized(requestWithAuth('Bearer anything'))).toBe(false);
  });

  it('allows when CRON_SECRET is unset outside production', () => {
    delete process.env.CRON_SECRET;
    process.env.NODE_ENV = 'development';
    expect(isCronRequestAuthorized(requestWithAuth(null))).toBe(true);
  });

  it('requires matching Bearer token when secret is set', () => {
    process.env.CRON_SECRET = 'cron-test-secret';
    process.env.NODE_ENV = 'production';
    expect(isCronRequestAuthorized(requestWithAuth('Bearer cron-test-secret'))).toBe(true);
    expect(isCronRequestAuthorized(requestWithAuth('Bearer wrong'))).toBe(false);
    expect(isCronRequestAuthorized(requestWithAuth(null))).toBe(false);
  });
});
