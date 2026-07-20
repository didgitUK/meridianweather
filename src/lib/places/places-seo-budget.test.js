import { describe, expect, it } from 'vitest';
import {
  PLACE_REFRESH_TIER,
  WEATHER_PLACE_SEO_MAX_AGE_MS,
  WEATHER_PLACE_SEO_STALE_MS,
} from '@/constants/weather-places';
import {
  canSpendPlaceSeoBudget,
  classifyPlaceSeoTier,
  resolveHotRefreshPlaceLimit,
  resolvePlaceSeoMaxAgeMs,
} from '@/lib/places/places-seo-budget';

describe('places-seo-budget', () => {
  it('classifies hot places by tier, views, or population', () => {
    expect(classifyPlaceSeoTier({ tier: PLACE_REFRESH_TIER.hot })).toBe('hot');
    expect(classifyPlaceSeoTier({ viewCount: 30 })).toBe('hot');
    expect(classifyPlaceSeoTier({ population: 250_000 })).toBe('hot');
  });

  it('classifies warm places by recent views', () => {
    expect(
      classifyPlaceSeoTier({
        tier: PLACE_REFRESH_TIER.cold,
        viewCount: 2,
        lastViewedAt: new Date().toISOString(),
      }),
    ).toBe('warm');
  });

  it('loosens max age when quota is low or place is cold', () => {
    expect(resolvePlaceSeoMaxAgeMs('hot', { remaining: 500 })).toBe(WEATHER_PLACE_SEO_MAX_AGE_MS);
    expect(resolvePlaceSeoMaxAgeMs('cold', { remaining: 500 })).toBe(WEATHER_PLACE_SEO_STALE_MS);
    expect(resolvePlaceSeoMaxAgeMs('hot', { remaining: 50 })).toBe(WEATHER_PLACE_SEO_STALE_MS);
  });

  it('caps SEO spend and hot refresh size by remaining budget', () => {
    expect(canSpendPlaceSeoBudget({ remaining: 500, dailyLimit: 1000 })).toBe(true);
    expect(canSpendPlaceSeoBudget({ remaining: 2, dailyLimit: 1000 })).toBe(false);
    // used=910 → below SEO budget gate
    expect(resolveHotRefreshPlaceLimit({ remaining: 90, dailyLimit: 1000 })).toBe(0);
    // used=100 → SEO budget left 500 → floor(500/3)=166
    expect(resolveHotRefreshPlaceLimit({ remaining: 900, dailyLimit: 1000 })).toBe(166);
  });
});
