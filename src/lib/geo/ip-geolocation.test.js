import { describe, expect, it, vi } from 'vitest';
import { isPrivateIp, lookupEgressIpGeolocation, lookupIpGeolocation } from '@/lib/geo/ip-geolocation';
import { getClientIpFromRequest } from '@/lib/geo/region-from-request';

describe('ip geolocation', () => {
  it('detects private ip addresses', () => {
    expect(isPrivateIp('127.0.0.1')).toBe(true);
    expect(isPrivateIp('192.168.1.4')).toBe(true);
    expect(isPrivateIp('8.8.8.8')).toBe(false);
  });

  it('maps ipwho.is responses into region hints', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        country_code: 'GB',
        city: 'Manchester',
        latitude: 53.48,
        longitude: -2.24,
      }),
    });

    await expect(lookupIpGeolocation('81.2.3.4', { fetchImpl })).resolves.toEqual({
      country: 'GB',
      lat: 53.48,
      lon: -2.24,
      city: 'Manchester',
      source: 'ip',
    });
  });

  it('resolves egress location for localhost development fallback', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        country_code: 'GB',
        city: 'Bolton',
        latitude: 53.5768,
        longitude: -2.4282,
      }),
    });

    await expect(lookupEgressIpGeolocation({ fetchImpl })).resolves.toEqual({
      country: 'GB',
      lat: 53.5768,
      lon: -2.4282,
      city: 'Bolton',
      source: 'ip',
    });
    expect(fetchImpl).toHaveBeenCalledWith('https://ipwho.is/', expect.any(Object));
  });

  it('reads the first forwarded ip address', () => {
    const request = {
      headers: {
        get(name) {
          if (name === 'x-forwarded-for') {
            return '203.0.113.10, 10.0.0.1';
          }

          return null;
        },
      },
    };

    expect(getClientIpFromRequest(request)).toBe('203.0.113.10');
  });
});
