import { describe, expect, it } from 'vitest';
import { assertWeatherPayload } from '@/lib/weather/contracts';

describe('weather contracts', () => {
  it('accepts a plausible current payload', () => {
    expect(() =>
      assertWeatherPayload({ temperature: 10, updatedAt: 1 }, 'current'),
    ).not.toThrow();
  });

  it('rejects timeline payloads without points', () => {
    expect(() => assertWeatherPayload({ scope: 'hourly' }, 'hourly')).toThrow(/points/);
  });
});
