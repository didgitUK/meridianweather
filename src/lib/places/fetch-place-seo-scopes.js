import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { getUsageSnapshot } from '@/lib/api-usage-tracker';
import { fetchWeatherForScope } from '@/lib/weather-fetch-orchestrator';
import {
  canSpendPlaceSeoBudget,
  classifyPlaceSeoTier,
  resolvePlaceSeoMaxAgeMs,
} from '@/lib/places/places-seo-budget';
import {
  findUkPlaceBySlug,
  recordUkPlaceFetched,
  recordUkPlaceView,
} from '@/lib/places/uk-places-repo';

/**
 * Fetch SEO weather for a place, respecting tiered max-age and daily SEO budget.
 */
export async function fetchPlaceScopesForSeo(city, locale, placeMeta = null) {
  const usage = getUsageSnapshot();
  const tierName = classifyPlaceSeoTier(placeMeta ?? {
    population: city?.population,
  });
  const maxAgeMs = resolvePlaceSeoMaxAgeMs(tierName, usage);
  const allowUpstream = canSpendPlaceSeoBudget(usage);

  const options = {
    lang: locale,
    trigger: WEATHER_CHECK_TRIGGERS.weatherPlaceSeo,
    maxAgeMs: allowUpstream ? maxAgeMs : resolvePlaceSeoMaxAgeMs('cold', { remaining: 0 }),
  };

  const [currentResponse, dailyResponse, hourlyResponse] = await Promise.all([
    fetchWeatherForScope(city.lat, city.lon, 'current', options),
    fetchWeatherForScope(city.lat, city.lon, 'daily', options),
    fetchWeatherForScope(city.lat, city.lon, 'hourly', options).catch(() => null),
  ]);

  const anyUpstream = [currentResponse, dailyResponse, hourlyResponse]
    .filter(Boolean)
    .some((response) => response.meta?.cacheLayer === 'upstream');

  if (anyUpstream && city?.seoSlug) {
    recordUkPlaceFetched(city.seoSlug);
  }

  return {
    current: currentResponse.data,
    currentMeta: currentResponse.meta,
    daily: dailyResponse.data,
    dailyMeta: dailyResponse.meta,
    hourly: hourlyResponse?.data ?? null,
    hourlyMeta: hourlyResponse?.meta ?? null,
  };
}
