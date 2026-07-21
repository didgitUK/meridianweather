import { NextResponse } from 'next/server';
import { PWA_CRON_WARM_CITY_CAP, PWA_MAX_PRIORITY_CITIES, PWA_NOTIFY_MODES, normalizePwaNotifyMode } from '@/constants/pwa';
import { upsertPushSubscription } from '@/lib/db/repositories/push-subscriptions';
import { apiError } from '@/lib/server/api-response';
import { enforceRateLimit } from '@/lib/server/rate-limit';
import { isWebPushConfigured } from '@/lib/server/web-push';

function normalizeCities(cities) {
  if (!Array.isArray(cities)) {
    return [];
  }

  return cities
    .map((city) => {
      const lat = Number(city?.lat);
      const lon = Number(city?.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return null;
      }
      return {
        id: typeof city.id === 'string' ? city.id : null,
        name: typeof city.name === 'string' ? city.name : null,
        country: typeof city.country === 'string' ? city.country : null,
        lat,
        lon,
      };
    })
    .filter(Boolean)
    .slice(0, PWA_MAX_PRIORITY_CITIES);
}

export async function POST(request) {
  const limited = enforceRateLimit(request, { bucket: 'push-subscribe', limit: 20, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  if (!isWebPushConfigured()) {
    return apiError('unavailable', 'Web Push is not configured', 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError('invalid_request', 'Invalid JSON body', 400);
  }

  const endpoint = typeof body?.endpoint === 'string' ? body.endpoint.trim() : '';
  const p256dh = typeof body?.keys?.p256dh === 'string' ? body.keys.p256dh : '';
  const auth = typeof body?.keys?.auth === 'string' ? body.keys.auth : '';
  const clientId = typeof body?.clientId === 'string' ? body.clientId.trim() : null;
  const notifyMode = normalizePwaNotifyMode(body?.notifyMode);

  if (!endpoint || !p256dh || !auth) {
    return apiError('invalid_request', 'endpoint and keys are required', 400);
  }

  const subscription = upsertPushSubscription({
    endpoint,
    p256dh,
    auth,
    clientId,
    cities: normalizeCities(body?.cities),
    notifyMode,
  });

  return NextResponse.json({
    ok: true,
    id: subscription.id,
    notifyMode: subscription.notifyMode ?? PWA_NOTIFY_MODES.daily,
    warmCityCap: PWA_CRON_WARM_CITY_CAP,
  });
}
