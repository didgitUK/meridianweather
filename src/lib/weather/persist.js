import {
  WEATHER_CHECK_CACHE_OUTCOMES,
  normalizeWeatherCheckTrigger,
} from '@/constants/weather-check-triggers';
import { setMemoryCache } from '@/lib/cache';
import {
  findOrCreateLocation,
  recordLocationWeatherCheck,
} from '@/lib/location-repo';
import {
  recordForecastArchive,
  recordWeatherObservation,
} from '@/lib/weather-history-repo';
import { writeSnapshot } from '@/lib/weather-snapshot-repo';
import { getScopeTtl } from '@/lib/weather/cache-policy';
import { assertWeatherPayload } from '@/lib/weather/contracts';

export async function persistAndReturn({
  lat,
  lon,
  scope,
  cacheKey,
  payload,
  source,
  trigger,
  tokensUsed = 1,
  ttlOptions = {},
}) {
  if (scope !== 'geocode' && scope !== 'alert') {
    assertWeatherPayload(payload, scope);
  }
  const now = new Date();
  const ttl = getScopeTtl(scope, { trigger, ...ttlOptions });
  const snapshot = writeSnapshot({
    lat,
    lon,
    scope,
    cacheKey,
    payload,
    fetchedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + ttl.fresh).toISOString(),
    staleUntil: new Date(now.getTime() + ttl.stale).toISOString(),
    source,
  });

  setMemoryCache(cacheKey, snapshot);

  if (scope === 'current') {
    recordWeatherObservation(lat, lon, payload, now.toISOString());

    const location = findOrCreateLocation(lat, lon, {
      name: payload.city,
      country: payload.country,
      state: payload.state,
    });
    recordLocationWeatherCheck(
      location.id,
      scope,
      payload,
      source,
      now.toISOString(),
      {
        trigger: normalizeWeatherCheckTrigger(trigger),
        cacheOutcome: WEATHER_CHECK_CACHE_OUTCOMES.upstream,
        tokensUsed,
      },
    );
  }

  if (['hourly', 'daily', 'minutely'].includes(scope)) {
    recordForecastArchive(lat, lon, scope, payload, now.toISOString());
  }

  return {
    data: payload,
    meta: {
      cacheLayer: 'upstream',
      freshness: 'fresh',
      fetchedAt: snapshot.fetchedAt,
      ageMs: 0,
      upstreamCallAvoided: false,
      source,
      trigger: normalizeWeatherCheckTrigger(trigger),
      tokensUsed,
    },
  };
}
