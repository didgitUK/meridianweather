import { afterEach, describe, expect, it, vi } from 'vitest';

const fetchJson = vi.fn();

vi.mock('@/lib/client/fetch-json', () => ({
  fetchJson: (...args) => fetchJson(...args),
}));

describe('loadWeatherBatch', () => {
  afterEach(() => {
    fetchJson.mockReset();
    vi.useRealTimers();
  });

  it('retries once after a 429 using Retry-After', async () => {
    vi.useFakeTimers();
    const { loadWeatherBatch } = await import('./weather-batch-client.js');

    const rateLimited = Object.assign(new Error('Too many requests. Please try again shortly.'), {
      status: 429,
      code: 'rate_limited',
      retryAfterSeconds: 1,
    });

    fetchJson
      .mockRejectedValueOnce(rateLimited)
      .mockResolvedValueOnce({ cities: [{ lat: 51.5, lon: -0.1 }] });

    const pending = loadWeatherBatch([{ lat: 51.5, lon: -0.1, scopes: ['current'] }], {
      trigger: 'city_detail',
    });

    await vi.advanceTimersByTimeAsync(1000);
    const payload = await pending;

    expect(payload.cities).toHaveLength(1);
    expect(fetchJson).toHaveBeenCalledTimes(2);
  });
});
