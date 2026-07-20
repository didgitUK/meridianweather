import { NextResponse } from 'next/server';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { WEATHER_PLACE_SEO_MAX_AGE_MS } from '@/constants/weather-places';
import { getUsageSnapshot } from '@/lib/api-usage-tracker';
import { fetchWeatherForScope } from '@/lib/weather-fetch-orchestrator';
import {
  canSpendPlaceSeoBudget,
  resolveHotRefreshPlaceLimit,
} from '@/lib/places/places-seo-budget';
import {
  listHotUkPlacesForRefresh,
  recordUkPlaceFetched,
  seedAllUkPlaces,
  countUkPlaces,
} from '@/lib/places/uk-places-repo';
import { finishProcessRun, startProcessRun } from '@/lib/process-run-repo';
import { apiError } from '@/lib/server/api-response';
import { isCronRequestAuthorized } from '@/lib/server/cron-auth';

export async function GET(request) {
  if (!isCronRequestAuthorized(request)) {
    return apiError('unauthorized', 'Unauthorized', 401);
  }

  const run = startProcessRun({
    job: 'weather-place-seo-refresh',
    meta: { source: 'cron' },
  });

  try {
    if (countUkPlaces() < 750) {
      seedAllUkPlaces();
    }

    const usage = getUsageSnapshot();
    if (!canSpendPlaceSeoBudget(usage)) {
      finishProcessRun(run.id, {
        status: 'skipped',
        counts: { refreshed: 0, reason: 'seo_budget_exhausted' },
      });
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: 'seo_budget_exhausted',
        usage: { used: usage.used, remaining: usage.remaining },
      });
    }

    const limit = resolveHotRefreshPlaceLimit(usage);
    const places = listHotUkPlacesForRefresh(limit);
    let refreshed = 0;
    let failed = 0;

    for (const place of places) {
      if (!canSpendPlaceSeoBudget(getUsageSnapshot())) {
        break;
      }

      const options = {
        trigger: WEATHER_CHECK_TRIGGERS.weatherPlaceSeo,
        maxAgeMs: WEATHER_PLACE_SEO_MAX_AGE_MS,
      };

      try {
        await Promise.all([
          fetchWeatherForScope(place.lat, place.lon, 'current', options),
          fetchWeatherForScope(place.lat, place.lon, 'daily', options),
          fetchWeatherForScope(place.lat, place.lon, 'hourly', options).catch(() => null),
        ]);
        recordUkPlaceFetched(place.slug);
        refreshed += 1;
      } catch {
        failed += 1;
      }
    }

    finishProcessRun(run.id, {
      status: 'ok',
      counts: { refreshed, failed, limit },
    });

    return NextResponse.json({
      ok: true,
      refreshed,
      failed,
      limit,
      usage: getUsageSnapshot(),
    });
  } catch (error) {
    finishProcessRun(run.id, {
      status: 'error',
      errorSummary: error?.message ?? 'refresh failed',
    });
    return apiError('upstream_error', error?.message ?? 'Refresh failed', 502);
  }
}
