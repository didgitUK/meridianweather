import { describe, expect, it } from 'vitest';
import { normalizePlaceSlug } from '@/lib/places/normalize-place-slug';

describe('normalizePlaceSlug', () => {
  it('decodes and lowercases', () => {
    expect(normalizePlaceSlug('Newcastle%20upon%20Tyne')).toBe('newcastle-upon-tyne');
  });

  it('collapses whitespace and hyphens', () => {
    expect(normalizePlaceSlug('  St   Ives  ')).toBe('st-ives');
  });

  it('returns empty for blank input', () => {
    expect(normalizePlaceSlug('')).toBe('');
    expect(normalizePlaceSlug(null)).toBe('');
  });
});
