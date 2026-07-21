import { NextResponse } from 'next/server';
import {
  PWA_CRON_WARM_CITY_CAP,
  PWA_NOTIFY_MODES,
} from '@/constants/pwa';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { evaluateOpenWeatherAlertMatches } from '@/lib/alerts/evaluate-alert-matches';
import {
  listPushSubscriptions,
  deletePushSubscriptionByEndpoint,
  touchPushSubscriptionNotified,
} from '@/lib/db/repositories/push-subscriptions';
import { fetchWeatherForScope } from '@/lib/weather-fetch-orchestrator';
import { getPlatformSettings } from '@/lib/platform-settings';
import { logErrorEvent } from '@/lib/error-log-repo';
import { finishProcessRun, startProcessRun } from '@/lib/process-run-repo';
import { apiError } from '@/lib/server/api-response';
import { isCronRequestAuthorized } from '@/lib/server/cron-auth';
import { isWebPushConfigured, sendWebPushNotification } from '@/lib/server/web-push';

function cityKey(city) {
  return `${Number(city.lat).toFixed(4)},${Number(city.lon).toFixed(4)}`;
}

function hasActiveSevere(matches) {
  return Object.values(matches ?? {}).some((entry) => entry?.active);
}

async function warmUniqueCities(subscriptions) {
  const unique = new Map();
  for (const subscription of subscriptions) {
    for (const city of subscription.cities ?? []) {
      const key = cityKey(city);
      if (!unique.has(key)) {
        unique.set(key, city);
      }
      if (unique.size >= PWA_CRON_WARM_CITY_CAP) {
        break;
      }
    }
    if (unique.size >= PWA_CRON_WARM_CITY_CAP) {
      break;
    }
  }

  const weatherByKey = new Map();
  let warmed = 0;

  for (const city of unique.values()) {
    try {
      const [currentResponse] = await Promise.all([
        fetchWeatherForScope(city.lat, city.lon, 'current', {
          trigger: WEATHER_CHECK_TRIGGERS.pwaPushRefresh,
        }),
        fetchWeatherForScope(city.lat, city.lon, 'daily', {
          trigger: WEATHER_CHECK_TRIGGERS.pwaPushRefresh,
        }),
      ]);
      weatherByKey.set(cityKey(city), currentResponse?.data ?? null);
      warmed += 1;
    } catch (error) {
      logErrorEvent({
        level: 'warn',
        source: 'cron.pwa-daily-refresh.warm',
        message: error?.message ?? 'Failed to warm city cache',
        stack: error instanceof Error ? error.stack : null,
      });
    }
  }

  return { uniqueCities: unique.size, warmed, weatherByKey };
}

function subscriptionHasSevere(subscription, weatherByKey, windThresholdMs) {
  for (const city of subscription.cities ?? []) {
    const weather = weatherByKey.get(cityKey(city));
    if (!weather) {
      continue;
    }
    const matches = evaluateOpenWeatherAlertMatches(weather, windThresholdMs);
    if (hasActiveSevere(matches)) {
      return true;
    }
  }
  return false;
}

function shouldNotify(subscription, weatherByKey, windThresholdMs) {
  const mode = subscription.notifyMode ?? PWA_NOTIFY_MODES.daily;
  const severe = subscriptionHasSevere(subscription, weatherByKey, windThresholdMs);

  if (mode === PWA_NOTIFY_MODES.severe) {
    return severe ? { send: true, kind: 'severe' } : { send: false, kind: null };
  }

  if (mode === PWA_NOTIFY_MODES.both) {
    return { send: true, kind: severe ? 'severe' : 'daily' };
  }

  // daily
  return { send: true, kind: 'daily' };
}

export async function GET(request) {
  if (!isCronRequestAuthorized(request)) {
    return apiError('unauthorized', 'Cron authorization required', 401);
  }

  if (!isWebPushConfigured()) {
    return apiError('unavailable', 'Web Push is not configured', 503);
  }

  const run = startProcessRun({ job: 'pwa-daily-refresh' });

  try {
    const settings = getPlatformSettings();
    const windThresholdMs = settings.windAlertThresholdMs ?? 15;
    const subscriptions = listPushSubscriptions();
    const warm = await warmUniqueCities(subscriptions);

    let sent = 0;
    let skipped = 0;
    let gone = 0;
    let failed = 0;

    for (const subscription of subscriptions) {
      const decision = shouldNotify(subscription, warm.weatherByKey, windThresholdMs);
      if (!decision.send) {
        skipped += 1;
        continue;
      }

      const payload = decision.kind === 'severe'
        ? {
            type: 'meridian-severe-alert',
            trigger: WEATHER_CHECK_TRIGGERS.pwaPushRefresh,
            title: 'meridian',
            body: 'Severe weather conditions near one of your places. Open meridian for details.',
            url: '/',
          }
        : {
            type: 'meridian-daily-refresh',
            trigger: WEATHER_CHECK_TRIGGERS.pwaPushRefresh,
            title: 'meridian',
            body: 'Your places were refreshed on this device.',
            url: '/',
          };

      try {
        await sendWebPushNotification(subscription, payload);
        touchPushSubscriptionNotified(subscription.id);
        sent += 1;
      } catch (error) {
        const statusCode = error?.statusCode ?? error?.status ?? null;
        if (statusCode === 404 || statusCode === 410) {
          deletePushSubscriptionByEndpoint(subscription.endpoint);
          gone += 1;
        } else {
          failed += 1;
          logErrorEvent({
            level: 'warn',
            source: 'cron.pwa-daily-refresh.push',
            message: error?.message ?? 'Push send failed',
            stack: error instanceof Error ? error.stack : null,
            correlationId: run.id,
          });
        }
      }
    }

    const summary = {
      subscriptions: subscriptions.length,
      uniqueCities: warm.uniqueCities,
      warmed: warm.warmed,
      sent,
      skipped,
      gone,
      failed,
    };

    finishProcessRun(run.id, { status: 'ok', summary });
    return NextResponse.json(summary);
  } catch (error) {
    finishProcessRun(run.id, {
      status: 'error',
      summary: { message: error?.message ?? 'pwa-daily-refresh failed' },
    });
    logErrorEvent({
      level: 'error',
      source: 'cron.pwa-daily-refresh',
      message: error?.message ?? 'pwa-daily-refresh failed',
      stack: error instanceof Error ? error.stack : null,
      correlationId: run.id,
    });
    return apiError('upstream_error', error?.message ?? 'pwa-daily-refresh failed', 500);
  }
}
