import { describe, expect, it } from 'vitest';
import {
  inferProfileFromHistory,
  resolveEffectiveLocationProfile,
} from '@/features/cities/utils/user-location-profile';

describe('user location profile', () => {
  it('infers a dominant country from recent checks', () => {
    const profile = inferProfileFromHistory({
      countryCounts: { GB: 4, US: 1 },
      checks: [
        { country: 'GB', lat: 53.5, lon: -2.2, at: '2026-01-01T00:00:00.000Z' },
        { country: 'GB', lat: 51.5, lon: -0.1, at: '2026-01-02T00:00:00.000Z' },
      ],
    });

    expect(profile?.country).toBe('GB');
    expect(profile?.source).toBe('history');
  });

  it('prefers confirmed home locations over gps and history', () => {
    const resolved = resolveEffectiveLocationProfile({
      source: 'confirmed',
      name: 'Carlisle',
      country: 'GB',
      lat: 54.9,
      lon: -2.9,
      label: 'Carlisle, GB',
      ipHint: { country: 'US', lat: 40.7, lon: -74.0 },
      countryCounts: { US: 5 },
      checks: [{ country: 'US', lat: 40.7, lon: -74.0, at: '2026-01-01T00:00:00.000Z' }],
    });

    expect(resolved?.source).toBe('confirmed');
    expect(resolved?.name).toBe('Carlisle');
  });
});
