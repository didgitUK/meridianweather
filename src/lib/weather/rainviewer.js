const RAINVIEWER_MAPS_URL = 'https://api.rainviewer.com/public/weather-maps.json';

/**
 * Latest RainViewer composite radar frame for live precip underlay.
 * @param {{ signal?: AbortSignal }} [opts]
 * @returns {Promise<{ host: string, path: string, urlTemplate: string } | null>}
 */
export async function fetchLatestRadarFrame({ signal } = {}) {
  try {
    const response = await fetch(RAINVIEWER_MAPS_URL, {
      signal,
      next: undefined,
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    const host = typeof data?.host === 'string' ? data.host : null;
    const past = Array.isArray(data?.radar?.past) ? data.radar.past : [];
    const nowcast = Array.isArray(data?.radar?.nowcast) ? data.radar.nowcast : [];
    const frame = past[past.length - 1] ?? nowcast[0] ?? null;
    const path = typeof frame?.path === 'string' ? frame.path : null;
    if (!host || !path) {
      return null;
    }
    return {
      host,
      path,
      urlTemplate: `${host}${path}/256/{z}/{x}/{y}/2/1_1.png`,
    };
  } catch {
    return null;
  }
}
