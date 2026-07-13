import { describe, expect, it } from 'vitest';
import {
  buildSearchResultKey,
  countryCodeToFlagEmoji,
  formatCityResultLabel,
  formatCitySubtitle,
} from '@/features/cities/utils/city-search';

describe('city-search utils', () => {
  it('builds flag emoji from country code', () => {
    expect(countryCodeToFlagEmoji('AE')).toBe('🇦🇪');
    expect(countryCodeToFlagEmoji('')).toBe('🌍');
  });

  it('formats subtitle with county and full country name', () => {
    const result = {
      name: 'Blackpool',
      county: 'South Hams',
      state: 'England',
      country: 'GB',
      lat: 50.3,
      lon: -3.6,
    };

    expect(formatCitySubtitle(result)).toBe('South Hams, United Kingdom');
    expect(formatCityResultLabel(result)).toBe('Blackpool, South Hams, United Kingdom');
    expect(buildSearchResultKey(result)).toBe('50.3,-3.6');
  });

  it('includes distance from the user when location is known', () => {
    const result = {
      name: 'Blackpool',
      county: 'Borough of Blackpool',
      country: 'GB',
      lat: 53.8179,
      lon: -3.0509,
    };

    expect(
      formatCitySubtitle(result, {
        userContext: { lat: 53.48, lon: -2.24 },
      }),
    ).toMatch(/Borough of Blackpool, United Kingdom · \d+ km away/);
  });
});
