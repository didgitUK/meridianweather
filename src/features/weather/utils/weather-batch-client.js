import { fetchJson } from '@/lib/client/fetch-json';
import { singleFlight } from '@/lib/client/single-flight';

/** Force upstream refresh by rejecting any cached snapshot age. */
export const FORCE_REFRESH_MAX_AGE_MS = -1;

function batchFlightKey(cities, { trigger, lang } = {}) {
  const normalized = (cities ?? []).map((city) => ({
    lat: Number(city.lat).toFixed(4),
    lon: Number(city.lon).toFixed(4),
    scopes: [...(city.scopes ?? [])].sort(),
    maxAgeMs: city.maxAgeMs ?? null,
    trigger: city.trigger ?? trigger ?? null,
    lang: city.lang ?? lang ?? null,
  }));

  return `weather-batch:${lang ?? ''}:${trigger ?? ''}:${JSON.stringify(normalized)}`;
}

/**
 * Merge one batch entry's scopes into a target map.
 * Persistence is handled by callers via writeLocalWeatherCache.
 */
export function mergeBatchScopes(entry, scopes, { target = {} } = {}) {
  const merged = { ...target };

  for (const scope of scopes) {
    const scopePayload = entry?.scopes?.[scope];
    if (scopePayload?.error) {
      merged[scope] = { error: scopePayload.error };
      continue;
    }
    if (scopePayload?.data) {
      merged[scope] = { data: scopePayload.data, meta: scopePayload.meta };
    }
  }

  return merged;
}

/**
 * Persist successful scope payloads from a batch entry into L0 cache.
 */
export function persistBatchScopes(entry, scopes, writeCache) {
  if (typeof writeCache !== 'function') {
    return;
  }

  for (const scope of scopes) {
    const scopePayload = entry?.scopes?.[scope];
    if (scopePayload?.data) {
      writeCache(scope, {
        payload: scopePayload.data,
        fetchedAt: scopePayload.meta?.fetchedAt ?? new Date().toISOString(),
      });
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function postWeatherBatch(body, { retryOnRateLimit = true } = {}) {
  try {
    return await fetchJson('/api/weather/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (error) {
    if (!retryOnRateLimit || error?.status !== 429) {
      throw error;
    }

    const waitMs = Math.min(
      Math.max(Number(error.retryAfterSeconds) || 2, 1) * 1000,
      8_000,
    );
    await sleep(waitMs);
    return fetchJson('/api/weather/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }
}

/**
 * POST /api/weather/batch for one or more cities.
 * Returns `{ cities }` from the API.
 */
export async function loadWeatherBatch(cities, { trigger, lang } = {}) {
  if (!Array.isArray(cities) || cities.length === 0) {
    return { cities: [] };
  }

  const body = {
    cities,
    ...(trigger ? { trigger } : {}),
    ...(lang ? { lang } : {}),
  };

  return singleFlight(batchFlightKey(cities, { trigger, lang }), () =>
    postWeatherBatch(body),
  );
}

export async function loadWeatherBatchForCity({ lat, lon, scopes, maxAgeMs, trigger, lang }) {
  const payload = await loadWeatherBatch(
    [
      {
        lat,
        lon,
        scopes,
        ...(maxAgeMs != null ? { maxAgeMs } : {}),
        ...(trigger ? { trigger } : {}),
        ...(lang ? { lang } : {}),
      },
    ],
    { trigger, lang },
  );

  return payload.cities?.[0] ?? null;
}
