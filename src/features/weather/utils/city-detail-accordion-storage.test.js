import { describe, expect, it } from 'vitest';

import {
  CITY_DETAIL_ACCORDION_CONDITIONS,
  CITY_DETAIL_ACCORDION_LOCATION,
  CITY_DETAIL_ACCORDION_SUN_TIMES,
} from '@/constants/city-detail';
import {
  parseCityDetailAccordion,
  serializeCityDetailAccordion,
} from '@/features/weather/utils/city-detail-accordion-storage';

describe('city-detail-accordion-storage', () => {
  it('defaults to closed sections', () => {
    expect(parseCityDetailAccordion('')).toEqual([]);
    expect(parseCityDetailAccordion('[]')).toEqual([]);
    expect(parseCityDetailAccordion('not-json')).toEqual([]);
  });

  it('keeps only known accordion sections', () => {
    expect(parseCityDetailAccordion(JSON.stringify([
      CITY_DETAIL_ACCORDION_LOCATION,
      'unknown',
      CITY_DETAIL_ACCORDION_SUN_TIMES,
      CITY_DETAIL_ACCORDION_CONDITIONS,
    ]))).toEqual([
      CITY_DETAIL_ACCORDION_CONDITIONS,
    ]);
  });

  it('serializes open sections', () => {
    expect(serializeCityDetailAccordion([
      CITY_DETAIL_ACCORDION_SUN_TIMES,
      CITY_DETAIL_ACCORDION_CONDITIONS,
    ])).toBe(
      JSON.stringify([CITY_DETAIL_ACCORDION_CONDITIONS]),
    );
  });
});
