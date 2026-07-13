import { afterEach, describe, expect, it } from 'vitest';
import { decryptSecret, encryptSecret } from './secret-crypto';

describe('secret-crypto', () => {
  afterEach(() => {
    delete process.env.ADMIN_SECRET;
    delete process.env.ADMIN_PASSWORD;
  });

  it('round-trips with ADMIN_SECRET', () => {
    process.env.ADMIN_SECRET = 'test-admin-secret';
    const encrypted = encryptSecret('refresh-token-value');
    expect(encrypted.startsWith('v1:')).toBe(true);
    expect(decryptSecret(encrypted)).toBe('refresh-token-value');
  });

  it('uses plain prefix when no admin secret', () => {
    const encrypted = encryptSecret('plain-token');
    expect(encrypted).toBe('plain:plain-token');
    expect(decryptSecret(encrypted)).toBe('plain-token');
  });
});
