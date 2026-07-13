import { NextResponse } from 'next/server';
import {
  evaluateOfficialAlertMatches,
  evaluateOpenWeatherAlertMatches,
  mergeAlertMatches,
} from '@/lib/alerts/evaluate-alert-matches';
import { fetchNwsActiveAlerts } from '@/lib/alerts/fetch-nws-alerts';
import { fetchOpenMeteoWarnings } from '@/lib/alerts/fetch-open-meteo-warnings';
import { ALL_ALERT_TYPES } from '@/constants/alert-types';
import { fetchWeatherForScope } from '@/lib/weather-fetch-orchestrator';
import {
  getLastSendCondition,
  listActiveSubscriptions,
  logSubscriptionSend,
} from '@/lib/db/repositories/subscriptions';
import { sendWeatherAlertEmail } from '@/lib/email';
import { getPlatformSettings } from '@/lib/platform-settings';
import { apiError } from '@/lib/server/api-response';
import { isCronRequestAuthorized } from '@/lib/server/cron-auth';

async function getCityAlertContext(lat, lon, settings) {
  const weatherResponse = await fetchWeatherForScope(lat, lon, 'current');
  const weather = weatherResponse.data;
  const openWeatherMatches = evaluateOpenWeatherAlertMatches(
    weather,
    settings.windAlertThresholdMs ?? 15,
  );

  const officialEvents = [];

  if (settings.openMeteoAlertsEnabled) {
    try {
      officialEvents.push(...(await fetchOpenMeteoWarnings(lat, lon)));
    } catch {
      // Keep cron resilient when the public feed is temporarily unavailable.
    }
  }

  if (settings.nwsAlertsEnabled) {
    try {
      officialEvents.push(...(await fetchNwsActiveAlerts(lat, lon)));
    } catch {
      // Outside US coverage / temporary failures are ignored.
    }
  }

  const officialMatches = evaluateOfficialAlertMatches(officialEvents);
  const matches = mergeAlertMatches(openWeatherMatches, officialMatches);

  return { weather, matches };
}

export async function GET(request) {
  if (!isCronRequestAuthorized(request)) {
    return apiError('unauthorized', 'Cron authorization required', 401);
  }

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
    contexts.set(key, await getCityAlertContext(city.lat, city.lon, settings));
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

      logSubscriptionSend({
        subscriptionId: sub.id,
        cityLat: sub.cityLat,
        cityLon: sub.cityLon,
        condition: conditionKey,
      });

      const result = await sendWeatherAlertEmail({
        email: sub.email,
        cityName: sub.cityName,
        condition: `${type.label}: ${match.label}`,
        unsubscribeToken: sub.unsubscribeToken,
      });

      if (result.sent) sent += 1;
    }
  }

  return NextResponse.json({
    processed: subscriptions.length,
    citiesChecked: cityKeys.size,
    alertsSent: sent,
  });
}
