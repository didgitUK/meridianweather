import { NextResponse } from 'next/server';
import {
  evaluateOfficialAlertMatches,
  evaluateOpenWeatherAlertMatches,
  mergeAlertMatches,
} from '@/lib/alerts/evaluate-alert-matches';
import { fetchNwsActiveAlerts } from '@/lib/alerts/fetch-nws-alerts';
import { fetchOpenMeteoWarnings } from '@/lib/alerts/fetch-open-meteo-warnings';
import { ALL_ALERT_TYPES } from '@/constants/alert-types';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { fetchWeatherForScope } from '@/lib/weather-fetch-orchestrator';
import {
  getLastSendCondition,
  listActiveSubscriptions,
  logSubscriptionSend,
} from '@/lib/db/repositories/subscriptions';
import { sendWeatherAlertEmail } from '@/lib/email';
import { logErrorEvent } from '@/lib/error-log-repo';
import { getPlatformSettings } from '@/lib/platform-settings';
import { finishProcessRun, startProcessRun } from '@/lib/process-run-repo';
import { apiError } from '@/lib/server/api-response';
import { isCronRequestAuthorized } from '@/lib/server/cron-auth';

async function getCityAlertContext(lat, lon, settings, correlationId) {
  const [weatherResponse, dailyResponse] = await Promise.all([
    fetchWeatherForScope(lat, lon, 'current', { trigger: WEATHER_CHECK_TRIGGERS.cronAlerts }),
    fetchWeatherForScope(lat, lon, 'daily', { trigger: WEATHER_CHECK_TRIGGERS.cronAlerts }).catch(() => null),
  ]);
  const weather = weatherResponse.data;
  const dailyForecast = dailyResponse?.data ?? null;
  const openWeatherMatches = evaluateOpenWeatherAlertMatches(
    weather,
    settings.windAlertThresholdMs ?? 15,
  );

  const officialEvents = [];

  if (settings.openMeteoAlertsEnabled) {
    try {
      officialEvents.push(...(await fetchOpenMeteoWarnings(lat, lon)));
    } catch (error) {
      logErrorEvent({
        level: 'warn',
        source: 'cron.weather-alerts.open-meteo',
        message: error?.message ?? 'Open-Meteo warnings failed',
        stack: error instanceof Error ? error.stack : null,
        correlationId,
      });
    }
  }

  if (settings.nwsAlertsEnabled) {
    try {
      officialEvents.push(...(await fetchNwsActiveAlerts(lat, lon)));
    } catch (error) {
      logErrorEvent({
        level: 'warn',
        source: 'cron.weather-alerts.nws',
        message: error?.message ?? 'NWS alerts failed',
        stack: error instanceof Error ? error.stack : null,
        correlationId,
      });
    }
  }

  const officialMatches = evaluateOfficialAlertMatches(officialEvents);
  const matches = mergeAlertMatches(openWeatherMatches, officialMatches);

  return { weather, dailyForecast, matches };
}

export async function GET(request) {
  if (!isCronRequestAuthorized(request)) {
    return apiError('unauthorized', 'Cron authorization required', 401);
  }

  const run = startProcessRun({ job: 'weather-alerts' });

  try {
    const settings = getPlatformSettings();
    const subscriptions = listActiveSubscriptions();
    const cityKeys = new Map();

    for (const sub of subscriptions) {
      if (sub.cityLat == null || sub.cityLon == null) continue;
      const key = `${sub.cityLat},${sub.cityLon}`;
      if (!cityKeys.has(key)) {
        cityKeys.set(key, { lat: sub.cityLat, lon: sub.cityLon });
      }
    }

    const contexts = new Map();
    for (const [key, city] of cityKeys) {
      contexts.set(
        key,
        await getCityAlertContext(city.lat, city.lon, settings, run.correlationId),
      );
    }

    let sent = 0;

    for (const sub of subscriptions) {
      if (sub.type !== 'city_alerts') continue;

      const key = `${sub.cityLat},${sub.cityLon}`;
      const context = contexts.get(key);
      if (!context) continue;

      for (const type of ALL_ALERT_TYPES) {
        if (!sub.alertPrefs?.[type.id]) continue;

        const match = context.matches[type.id];
        if (!match?.active) continue;

        const conditionKey = `${type.id}:${match.label}`;
        const last = getLastSendCondition(sub.id, type.id);
        if (last === conditionKey) continue;

        const result = await sendWeatherAlertEmail({
          email: sub.email,
          cityName: sub.cityName,
          condition: `${type.label}: ${match.label}`,
          matchLabel: match.label,
          unsubscribeToken: sub.unsubscribeToken,
          alertTypeId: type.id,
          alertLabel: type.label,
          weather: context.weather,
          dailyForecast: context.dailyForecast,
        });

        if (!result?.sent) {
          continue;
        }

        logSubscriptionSend({
          subscriptionId: sub.id,
          cityLat: sub.cityLat,
          cityLon: sub.cityLon,
          condition: conditionKey,
        });

        sent += 1;
      }
    }

    finishProcessRun(run.id, {
      status: 'ok',
      counts: {
        processed: subscriptions.length,
        citiesChecked: cityKeys.size,
        alertsSent: sent,
      },
    });

    return NextResponse.json({
      processed: subscriptions.length,
      citiesChecked: cityKeys.size,
      alertsSent: sent,
      correlationId: run.correlationId,
    });
  } catch (error) {
    logErrorEvent({
      level: 'error',
      source: 'cron.weather-alerts',
      message: error?.message ?? 'Weather alerts cron failed',
      stack: error instanceof Error ? error.stack : null,
      correlationId: run.correlationId,
    });
    finishProcessRun(run.id, {
      status: 'error',
      errorSummary: error?.message ?? 'Weather alerts cron failed',
    });
    throw error;
  }
}
