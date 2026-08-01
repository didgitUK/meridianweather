import { describe, expect, it } from 'vitest';
import {
  getPlaceEditorialBlurb,
  PLACE_EDITORIAL_BLURBS,
} from '@/constants/place-editorial-blurbs';

describe('place-editorial-blurbs', () => {
  it('returns unique blurbs for hot places', () => {
    expect(Object.keys(PLACE_EDITORIAL_BLURBS).length).toBeGreaterThanOrEqual(25);
    expect(getPlaceEditorialBlurb('london')).toMatch(/London/);
    expect(getPlaceEditorialBlurb('manchester')).toMatch(/Manchester/);
    expect(getPlaceEditorialBlurb('london')).not.toBe(getPlaceEditorialBlurb('manchester'));
  });

  it('returns null for unknown slugs', () => {
    expect(getPlaceEditorialBlurb('not-a-real-place')).toBeNull();
  });
});
