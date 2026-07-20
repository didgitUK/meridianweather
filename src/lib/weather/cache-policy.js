import { SCOPE_TTL } from '@/constants/weather';
import {
  WEATHER_PLACE_SEO_MAX_AGE_MS,
  WEATHER_PLACE_SEO_STALE_MS,
} from '@/constants/weather-places';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { getPlatformSettings } from '@/lib/platform-settings';
import { getMemoryCache, setMemoryCache } from '@/lib/cache';
import { readSnapshot } from '@/lib/weather-snapshot-repo';
import { recordCacheHit } from '@/lib/api-usage-tracker';

export function getScopeTtl(scope, options = {}) {
  if (options.trigger === WEATHER_CHECK_TRIGGERS.weatherPlaceSeo) {
    return {
      fresh: WEATHER_PLACE_SEO_MAX_AGE_MS,
      stale: WEATHER_PLACE_SEO_STALE_MS,
    };
  }

  if (options.freshMs != null) {
    return {
      fresh: options.freshMs,
      stale: options.staleMs ?? options.freshMs * 2,
    };
  }

  const settings = getPlatformSettings();
  if (scope === 'current') {
    return {
      fresh: settings.refreshIntervalMs,
      stale: settings.staleCacheMaxMs,
    };
  }
  return SCOPE_TTL[scope] ?? SCOPE_TTL.current;
}

export function classifySnapshot(snapshot) {
  if (!snapshot) return 'missing';
  const now = Date.now();
  const expires = Date.parse(snapshot.expiresAt);
  const staleUntil = Date.parse(snapshot.staleUntil);

  if (now <= expires) return 'fresh';
  if (now <= staleUntil) return 'acceptable';
  return 'expired';
}

export function wrapSnapshot(snapshot, layer, freshness) {
  return {
    data: snapshot.payload,
    meta: {
      cacheLayer: layer,
      freshness,
      fetchedAt: snapshot.fetchedAt,
      ageMs: Date.now() - Date.parse(snapshot.fetchedAt),
      upstreamCallAvoided: true,
      source: snapshot.source,
    },
  };
}

export function readFromCaches(cacheKey, usageMeta = {}) {
  const memory = getMemoryCache(cacheKey);
  if (memory) {
    const freshness = classifySnapshot(memory);
    if (freshness !== 'expired') {
      recordCacheHit(memory.scope, {
        cacheKey,
        layer: 'memory',
        ...usageMeta,
      });
      return wrapSnapshot(memory, 'memory', freshness);
    }
  }

  const dbSnapshot = readSnapshot(cacheKey);
  if (dbSnapshot) {
    const freshness = classifySnapshot(dbSnapshot);
    if (freshness !== 'expired') {
      setMemoryCache(cacheKey, dbSnapshot);
      recordCacheHit(dbSnapshot.scope, {
        cacheKey,
        layer: 'database',
        ...usageMeta,
      });
      return wrapSnapshot(dbSnapshot, 'database', freshness);
    }
    if (freshness === 'acceptable' || freshness === 'expired') {
      return { emergency: dbSnapshot, freshness };
    }
  }

  return null;
}
