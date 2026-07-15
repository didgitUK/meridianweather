import { describe, expect, it } from 'vitest';
import { redactEmail, sanitizeLogMeta } from '@/lib/server/logger';

describe('logger sanitization', () => {
  it('redacts email locals', () => {
    expect(redactEmail('alice@example.com')).toBe('a***@example.com');
  });

  it('strips secrets from meta', () => {
    const cleaned = sanitizeLogMeta({
      email: 'bob@example.com',
      apiKey: 'secret-value',
      openWeatherApiKey: 'x',
      nested: { password: 'pw', ok: true },
    });

    expect(cleaned.email).toBe('b***@example.com');
    expect(cleaned.apiKey).toBe('[redacted]');
    expect(cleaned.openWeatherApiKey).toBe('[redacted]');
    expect(cleaned.nested.password).toBe('[redacted]');
    expect(cleaned.nested.ok).toBe(true);
  });
});
