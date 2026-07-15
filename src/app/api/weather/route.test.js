import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchWeatherForScope = vi.fn();

vi.mock('@/lib/weather-fetch-orchestrator', () => ({
  fetchWeatherForScope: (...args) => fetchWeatherForScope(...args),
}));

describe('GET /api/weather', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('returns weather payload with cache metadata on a valid request', async () => {
    fetchWeatherForScope.mockResolvedValue({
      data: {
        temperature: 18,
        description: 'clear sky',
        humidity: 55,
      },
      meta: {
        fetchedAt: '2026-07-15T12:00:00.000Z',
        cacheLayer: 'L1',
        freshness: 'fresh',
        source: 'openweather',
        trigger: 'dashboard_load',
        tokensUsed: 0,
      },
    });

    const { GET } = await import('./route.js');
    const response = await GET(
      new Request('http://localhost/api/weather?lat=51.5&lon=-0.1&scope=current&trigger=dashboard_load'),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('X-Cache')).toBe('L1');
    expect(body).toMatchObject({
      temperature: 18,
      description: 'clear sky',
      humidity: 55,
      fetchedAt: '2026-07-15T12:00:00.000Z',
      cacheHit: true,
      freshness: 'fresh',
      source: 'openweather',
      trigger: 'dashboard_load',
      tokensUsed: 0,
    });
    expect(fetchWeatherForScope).toHaveBeenCalledWith(51.5, -0.1, 'current', {
      trigger: 'dashboard_load',
    });
  });

  it('rejects invalid coordinates with invalid_request', async () => {
    const { GET } = await import('./route.js');
    const response = await GET(new Request('http://localhost/api/weather?lat=999&lon=-0.1'));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: 'invalid_request',
      message: 'Invalid latitude',
    });
    expect(fetchWeatherForScope).not.toHaveBeenCalled();
  });

  it('rejects an invalid lang with invalid_request', async () => {
    const { GET } = await import('./route.js');
    const response = await GET(
      new Request('http://localhost/api/weather?lat=51.5&lon=-0.1&lang=not-a-lang'),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('invalid_request');
    expect(body.message).toBe('Invalid lang');
    expect(fetchWeatherForScope).not.toHaveBeenCalled();
  });

  it('maps upstream failures through the API error envelope', async () => {
    fetchWeatherForScope.mockRejectedValue(new Error('OpenWeather request failed'));

    const { GET } = await import('./route.js');
    const response = await GET(new Request('http://localhost/api/weather?lat=51.5&lon=-0.1'));
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body).toEqual({
      error: 'upstream_error',
      message: 'OpenWeather request failed',
    });
  });
});
