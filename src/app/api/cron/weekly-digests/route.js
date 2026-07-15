import { NextResponse } from 'next/server';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { fetchWeatherForScope } from '@/lib/weather-fetch-orchestrator';
import { groupActiveWeeklyDigestsByEmail } from '@/lib/db/repositories/subscriptions';
import { sendWeeklyDigestEmail } from '@/lib/email';
import { logErrorEvent } from '@/lib/error-log-repo';
import { finishProcessRun, startProcessRun } from '@/lib/process-run-repo';
import { apiError } from '@/lib/server/api-response';
import { isCronRequestAuthorized } from '@/lib/server/cron-auth';

export async function GET(request) {
  if (!isCronRequestAuthorized(request)) {
    return apiError('unauthorized', 'Cron authorization required', 401);
  }

  const run = startProcessRun({ job: 'weekly-digests' });

  try {
    const groups = groupActiveWeeklyDigestsByEmail();
    const citySnapshots = new Map();
    let digestsPrepared = 0;
    let emailsSent = 0;
    let subscriberRows = 0;

    for (const subscriptions of groups.values()) {
      subscriberRows += subscriptions.length;

      for (const sub of subscriptions) {
        if (sub.cityLat == null || sub.cityLon == null) continue;
        const key = `${sub.cityLat},${sub.cityLon}`;
        if (citySnapshots.has(key)) continue;

        const response = await fetchWeatherForScope(sub.cityLat, sub.cityLon, 'current', {
          trigger: WEATHER_CHECK_TRIGGERS.cronDigest,
        });
        citySnapshots.set(key, response.data);
        digestsPrepared += 1;
      }
    }

    for (const subscriptions of groups.values()) {
      const email = subscriptions[0]?.email;
      if (!email) continue;

      const locations = [];

      for (const sub of subscriptions) {
        const key = `${sub.cityLat},${sub.cityLon}`;
        const weather = citySnapshots.get(key);
        if (!weather) continue;

        locations.push({
          cityName: sub.cityName,
          weather,
          unsubscribeToken: sub.unsubscribeToken,
        });
      }

      if (locations.length === 0) continue;

      const result = await sendWeeklyDigestEmail({ email, locations });
      if (result.sent) emailsSent += 1;
    }

    finishProcessRun(run.id, {
      status: 'ok',
      counts: {
        subscriberRows,
        uniqueEmails: groups.size,
        uniqueCities: citySnapshots.size,
        digestsPrepared,
        emailsSent,
      },
    });

    return NextResponse.json({
      subscriberRows,
      uniqueEmails: groups.size,
      uniqueCities: citySnapshots.size,
      digestsPrepared,
      emailsSent,
      correlationId: run.correlationId,
    });
  } catch (error) {
    logErrorEvent({
      level: 'error',
      source: 'cron.weekly-digests',
      message: error?.message ?? 'Weekly digests cron failed',
      stack: error instanceof Error ? error.stack : null,
      correlationId: run.correlationId,
    });
    finishProcessRun(run.id, {
      status: 'error',
      errorSummary: error?.message ?? 'Weekly digests cron failed',
    });
    throw error;
  }
}
