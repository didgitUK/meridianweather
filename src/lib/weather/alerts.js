import { fetchOpenWeather, getApiKey } from '@/lib/api-client';
import {
  canMakeUpstreamCall,
  trackUpstreamCall,
} from '@/lib/api-usage-tracker';
import { normalizeAlert } from '@/lib/one-call';
import { buildSnapshotKey } from '@/lib/weather-snapshot-repo';
import { readFromCaches, wrapSnapshot } from '@/lib/weather/cache-policy';
import { persistAndReturn } from '@/lib/weather/persist';

export async function fetchAlert(alertId) {
  const cacheKey = buildSnapshotKey(alertId, null, 'alert');
  const cached = readFromCaches(cacheKey);
  if (cached && !cached.emergency) return cached;

  if (!canMakeUpstreamCall()) {
    if (cached?.emergency) return wrapSnapshot(cached.emergency, 'database', 'emergency');
    throw new Error('Alert lookup paused until quota resets');
  }

  const key = getApiKey();
  const url = `https://api.openweathermap.org/data/4.0/onecall/alert/${alertId}?appid=${key}`;
  const tracked = await trackUpstreamCall(
    'onecall_alert',
    () => fetchOpenWeather(url, { endpoint: 'onecall_alert' }),
    { alertId },
  );

  if (tracked.blocked) {
    if (cached?.emergency) return wrapSnapshot(cached.emergency, 'database', 'emergency');
    throw new Error('Alert lookup paused until quota resets');
  }

  const payload = normalizeAlert(tracked.result.data);
  return persistAndReturn({
    lat: null,
    lon: null,
    scope: 'alert',
    cacheKey,
    payload,
    source: 'onecall_alert',
  });
}
