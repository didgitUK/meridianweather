import { getPlatformSettings } from '@/lib/platform-settings';

export class ApiError extends Error {
  constructor(message, { code, status = 500, details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function getApiKey() {
  const settings = getPlatformSettings();
  const configured = settings.openWeatherApiKey?.trim() ?? '';
  const key = configured || process.env.OPENWEATHER_API_KEY;

  if (!key) {
    throw new ApiError('OpenWeather API key is not configured', {
      code: 'service_unavailable',
      status: 502,
    });
  }

  return key;
}

const OPENWEATHER_FETCH_TIMEOUT_MS = 10_000;

export async function fetchOpenWeather(url, { endpoint = 'unknown' } = {}) {
  const started = Date.now();

  try {
    const response = await fetch(url, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(OPENWEATHER_FETCH_TIMEOUT_MS),
    });
    const durationMs = Date.now() - started;

    if (!response.ok) {
      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (response.status === 401) {
        throw new ApiError('OpenWeather rejected the API key', {
          code: 'service_unavailable',
          status: 502,
          details: payload,
        });
      }

      if (response.status === 404) {
        throw new ApiError('Weather data not found for this location', {
          code: 'location_not_found',
          status: 404,
          details: payload,
        });
      }

      if (response.status === 429) {
        throw new ApiError('OpenWeather rate limit reached', {
          code: 'rate_limited',
          status: 429,
          details: payload,
        });
      }

      throw new ApiError('OpenWeather upstream error', {
        code: 'upstream_error',
        status: 502,
        details: { endpoint, status: response.status, payload },
      });
    }

    const data = await response.json();
    return { data, durationMs };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to reach OpenWeather', {
      code: 'upstream_error',
      status: 502,
      details: { endpoint, message: error.message },
    });
  }
}
