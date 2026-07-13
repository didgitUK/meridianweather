import { fetchJson } from '@/lib/client/fetch-json';

/** Force upstream refresh by rejecting any cached snapshot age. */
export const FORCE_REFRESH_MAX_AGE_MS = -1;

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

/**
 * POST /api/weather/batch for one or more cities.
 * Returns `{ cities }` from the API.
 */
export async function loadWeatherBatch(cities, { trigger } = {}) {
  if (!Array.isArray(cities) || cities.length === 0) {
    return { cities: [] };
  }

  return fetchJson('/api/weather/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cities,
      ...(trigger ? { trigger } : {}),
    }),
  });
}

export async function loadWeatherBatchForCity({ lat, lon, scopes, maxAgeMs, trigger }) {
  const payload = await loadWeatherBatch(
    [
      {
        lat,
        lon,
        scopes,
        ...(maxAgeMs != null ? { maxAgeMs } : {}),
        ...(trigger ? { trigger } : {}),
      },
    ],
    { trigger },
  );

  return payload.cities?.[0] ?? null;
}
