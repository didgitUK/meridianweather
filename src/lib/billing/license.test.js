import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  createAdFreeLicenseToken,
  createRestoreToken,
  verifyAdFreeLicenseToken,
  verifyRestoreToken,
} from '@/lib/billing/license';

describe('ad-free license tokens', () => {
  const previous = process.env.ADFEEE_LICENSE_SECRET;

  beforeEach(() => {
    process.env.ADFEEE_LICENSE_SECRET = 'test-adfree-secret';
  });

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.ADFEEE_LICENSE_SECRET;
    } else {
      process.env.ADFEEE_LICENSE_SECRET = previous;
    }
  });

  it('round-trips an active license', () => {
    const token = createAdFreeLicenseToken({
      email: 'you@example.com',
      plan: 'annual',
      status: 'active',
      expiresAt: null,
    });
    const license = verifyAdFreeLicenseToken(token);
    expect(license?.isAdFree).toBe(true);
    expect(license?.email).toBe('you@example.com');
    expect(license?.plan).toBe('annual');
  });

  it('rejects tampered tokens', () => {
    const token = createAdFreeLicenseToken({
      email: 'you@example.com',
      plan: 'monthly',
    });
    expect(verifyAdFreeLicenseToken(`${token}x`)).toBeNull();
  });

  it('issues and verifies restore tokens', () => {
    const token = createRestoreToken('you@example.com');
    expect(verifyRestoreToken(token)?.email).toBe('you@example.com');
  });
});
