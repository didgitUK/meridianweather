import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { listPopularSearchChecks } from '@/lib/location-repo';
import { buildCityId } from '@/lib/utils';

/** Weather lookups caused by someone searching / selecting a place. */
const USER_SEARCH_TRIGGERS = [
  WEATHER_CHECK_TRIGGERS.searchSelect,
  WEATHER_CHECK_TRIGGERS.searchPreview,
];

function withCityIds(checks) {
  return checks.map((check) => ({
    ...check,
    cityId: check.cityName
      ? buildCityId(check.cityName, check.country ?? 'XX', check.lat)
      : `location-${check.lat.toFixed(4)}-${check.lon.toFixed(4)}`,
  }));
}

/**
 * Meridian popular searches for `/api/recent-checks` — ranked by search volume.
 */
export async function getRecentChecksPayload({ limit = 20 } = {}) {
  const checks = withCityIds(
    listPopularSearchChecks(limit, { triggers: USER_SEARCH_TRIGGERS }),
  );

  return {
    checks,
    source: checks.length > 0 ? 'popular' : 'empty',
  };
}
