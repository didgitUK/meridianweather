import { NextResponse } from 'next/server';
import { PLACE_GUIDE_CRON_PLACE_LIMIT } from '@/constants/place-content';
import { classifyPlaceSeoTier } from '@/lib/places/places-seo-budget';
import { runPlaceContentPipeline } from '@/lib/places/place-content-pipeline';
import { getPlaceContentBudgetSnapshot } from '@/lib/places/place-content-budget';
import {
  listHotUkPlacesForRefresh,
  seedAllUkPlaces,
  countUkPlaces,
} from '@/lib/places/uk-places-repo';
import { getPlaceWeatherForSeo } from '@/lib/places/weather-place-seo';
import { finishProcessRun, startProcessRun } from '@/lib/process-run-repo';
import { apiError } from '@/lib/server/api-response';
import { isCronRequestAuthorized } from '@/lib/server/cron-auth';

export async function GET(request) {
  if (!isCronRequestAuthorized(request)) {
    return apiError('unauthorized', 'Unauthorized', 401);
  }

  const run = startProcessRun({
    job: 'place-content',
    meta: { source: 'cron' },
  });

  try {
    if (countUkPlaces() < 750) {
      seedAllUkPlaces();
    }

    const budget = getPlaceContentBudgetSnapshot();
    if (budget.llmRemaining <= 0 && budget.overpassRemaining <= 0) {
      finishProcessRun(run.id, {
        status: 'skipped',
        counts: { reason: 'place_content_budget_exhausted' },
      });
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: 'place_content_budget_exhausted',
        budget,
      });
    }

    const places = listHotUkPlacesForRefresh(PLACE_GUIDE_CRON_PLACE_LIMIT);
    let generated = 0;
    let skipped = 0;
    let failed = 0;

    for (const place of places) {
      const tier = classifyPlaceSeoTier(place);
      if (tier === 'cold') {
        skipped += 1;
        continue;
      }

      let weather = null;
      try {
        weather = await getPlaceWeatherForSeo(
          {
            lat: place.lat,
            lon: place.lon,
            seoSlug: place.slug,
            name: place.name,
          },
          'en',
        );
      } catch {
        weather = null;
      }

      try {
        const result = await runPlaceContentPipeline({
          place: {
            slug: place.slug,
            name: place.name,
            lat: place.lat,
            lon: place.lon,
            adminArea: place.adminArea,
            country: place.country,
            population: place.population,
            placeType: place.placeType,
          },
          weather,
        });

        if (result.skipped) {
          skipped += 1;
        } else if (result.ok) {
          generated += 1;
        } else {
          failed += 1;
        }
      } catch {
        failed += 1;
      }

      if (getPlaceContentBudgetSnapshot().llmRemaining <= 0) {
        break;
      }
    }

    finishProcessRun(run.id, {
      status: failed && !generated ? 'error' : 'ok',
      counts: { generated, skipped, failed, limit: PLACE_GUIDE_CRON_PLACE_LIMIT },
    });

    return NextResponse.json({
      ok: true,
      generated,
      skipped,
      failed,
      budget: getPlaceContentBudgetSnapshot(),
    });
  } catch (error) {
    finishProcessRun(run.id, {
      status: 'error',
      errorSummary: error.message,
    });
    return apiError('cron_failed', error.message, 500);
  }
}
