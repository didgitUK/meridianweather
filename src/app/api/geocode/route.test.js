import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchGeocode = vi.fn();
const enforceRateLimit = vi.fn(() => null);

vi.mock('@/lib/weather-fetch-orchestrator', () => ({
  fetchGeocode: (...args) => fetchGeocode(...args),
}));

vi.mock('@/lib/server/rate-limit', () => ({
  enforceRateLimit: (...args) => enforceRateLimit(...args),
}));

describe('GET /api/geocode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    enforceRateLimit.mockReturnValue(null);
  });

  it('returns geocode results for a valid query', async () => {
    fetchGeocode.mockResolvedValue({
      data: {
        results: [
          {
            name: 'London',
            country: 'GB',
            lat: 51.5074,
            lon: -0.1278,
          },
        ],
      },
      meta: { cacheLayer: 'L1' },
    });

    const { GET } = await import('./route.js');
    const response = await GET(new Request('http://localhost/api/geocode?q=London'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('X-Cache')).toBe('L1');
    expect(body.results).toHaveLength(1);
    expect(body.results[0]).toMatchObject({
      name: 'London',
      country: 'GB',
      lat: 51.5074,
      lon: -0.1278,
    });
    expect(fetchGeocode).toHaveBeenCalledWith('London', null);
  });

  it('rejects short queries with invalid_request', async () => {
    const { GET } = await import('./route.js');
    const response = await GET(new Request('http://localhost/api/geocode?q=L'));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: 'invalid_request',
      message: 'Search query must be at least 2 characters',
    });
    expect(fetchGeocode).not.toHaveBeenCalled();
  });

  it('passes through an early rate-limit response', async () => {
    const limited = new Response(JSON.stringify({ error: 'rate_limited', message: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
    enforceRateLimit.mockReturnValue(limited);

    const { GET } = await import('./route.js');
    const response = await GET(new Request('http://localhost/api/geocode?q=London'));

    expect(response.status).toBe(429);
    expect(fetchGeocode).not.toHaveBeenCalled();
  });

  it('maps upstream geocode failures through the API error envelope', async () => {
    fetchGeocode.mockRejectedValue(new Error('Geocoding unavailable'));

    const { GET } = await import('./route.js');
    const response = await GET(new Request('http://localhost/api/geocode?q=London'));
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body).toEqual({
      error: 'upstream_error',
      message: 'Geocoding unavailable',
    });
  });
});
