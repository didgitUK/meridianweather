import { describe, expect, it } from 'vitest';
import {
  CITY_DETAIL_DEFAULT_TAB,
  CITY_DETAIL_TAB_IDS,
  normalizeCityDetailTab,
} from '@/constants/city-detail';

describe('city-detail tabs', () => {
  it('normalizes known and unknown tab ids', () => {
    expect(normalizeCityDetailTab('hourly')).toBe(CITY_DETAIL_TAB_IDS.hourly);
    expect(normalizeCityDetailTab('next-hour')).toBe(CITY_DETAIL_DEFAULT_TAB);
    expect(normalizeCityDetailTab('nope')).toBe(CITY_DETAIL_DEFAULT_TAB);
    expect(normalizeCityDetailTab(null)).toBe(CITY_DETAIL_DEFAULT_TAB);
  });
});
