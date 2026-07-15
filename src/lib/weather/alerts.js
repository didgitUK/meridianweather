import { fetchOpenWeather, getApiKey } from '@/lib/api-client';
import {
  canMakeUpstreamCall,
  trackUpstreamCall,
} from '@/lib/api-usage-tracker';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { normalizeAlert } from '@/lib/one-call';
import { parseAlertId } from '@/lib/validators';
import { buildSnapshotKey } from '@/lib/weather-snapshot-repo';
import { readFromCaches, wrapSnapshot } from '@/lib/weather/cache-policy';
import { persistAndReturn } from '@/lib/weather/persist';

export async function fetchAlert(rawAlertId) {
  const alertId = parseAlertId(rawAlertId);
  const cacheKey = buildSnapshotKey(alertId, null, 'alert');
  const cached = readFromCaches(cacheKey, {
    trigger: WEATHER_CHECK_TRIGGERS.alertDetail,
    alertId,
  });
  if (cached && !cached.emergency) return cached;

  if (!canMakeUpstreamCall()) {
    if (cached?.emergency) return wrapSnapshot(cached.emergency, 'database', 'emergency');
    throw new Error('Alert lookup paused until quota resets');
  }

  const key = getApiKey();
  const url = `https://api.openweathermap.org/data/4.0/onecall/alert/${encodeURIComponent(alertId)}?appid=${key}`;
  const tracked = await trackUpstreamCall(
    'onecall_alert',
    () => fetchOpenWeather(url, { endpoint: 'onecall_alert' }),
    {
      alertId,
      trigger: WEATHER_CHECK_TRIGGERS.alertDetail,
      reason: 'alert_detail_lookup',
    },
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
    trigger: WEATHER_CHECK_TRIGGERS.alertDetail,
  });
}
