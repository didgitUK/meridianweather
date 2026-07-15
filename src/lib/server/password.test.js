import { describe, expect, it } from 'vitest';
import {
  hashPassword,
  MAX_PASSWORD_LENGTH,
  validatePasswordPolicy,
  verifyPassword,
} from '@/lib/server/password';

describe('password hashing', () => {
  it('hashes and verifies a password', () => {
    const hash = hashPassword('correct-horse-battery');
    expect(hash.startsWith('scrypt:')).toBe(true);
    expect(verifyPassword('correct-horse-battery', hash)).toBe(true);
    expect(verifyPassword('wrong-password', hash)).toBe(false);
  });

  it('rejects oversized passwords before scrypt', () => {
    const long = 'a'.repeat(MAX_PASSWORD_LENGTH + 1);
    expect(validatePasswordPolicy(long).ok).toBe(false);
    expect(() => hashPassword(long)).toThrow(/at most/);
    expect(verifyPassword(long, 'scrypt:1:1:1:x:y')).toBe(false);
  });
});
