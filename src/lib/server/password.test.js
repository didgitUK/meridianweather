import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/server/password';

describe('password hashing', () => {
  it('hashes and verifies a password', () => {
    const hash = hashPassword('correct-horse-battery');
    expect(hash.startsWith('scrypt:')).toBe(true);
    expect(verifyPassword('correct-horse-battery', hash)).toBe(true);
    expect(verifyPassword('wrong-password', hash)).toBe(false);
  });
});
