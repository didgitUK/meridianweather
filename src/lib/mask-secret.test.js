import { describe, expect, it } from 'vitest';
import { maskSecret } from '@/lib/mask-secret';

describe('maskSecret', () => {
  it('masks long secrets while keeping prefix and suffix', () => {
    expect(maskSecret('1415c837d23adc870adda5e557ebdef6')).toBe('1415••••••••••••••••••••••••def6');
  });

  it('returns bullets for short secrets', () => {
    expect(maskSecret('abc')).toBe('••••••••');
  });
});
