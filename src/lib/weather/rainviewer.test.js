import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchLatestRadarFrame } from '@/lib/weather/rainviewer';

describe('fetchLatestRadarFrame', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('builds a tile URL from the latest past frame', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          host: 'https://tilecache.rainviewer.com',
          radar: {
            past: [{ path: '/v2/radar/100' }, { path: '/v2/radar/200' }],
            nowcast: [],
          },
        }),
      })),
    );

    const frame = await fetchLatestRadarFrame();
    expect(frame?.urlTemplate).toBe(
      'https://tilecache.rainviewer.com/v2/radar/200/256/{z}/{x}/{y}/2/1_1.png',
    );
  });

  it('returns null when the API is unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
      })),
    );
    expect(await fetchLatestRadarFrame()).toBeNull();
  });
});
