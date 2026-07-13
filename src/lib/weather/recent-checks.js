import { PLATFORM_SHOWCASE_CITIES } from '@/constants/platform';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { listRecentLocationChecks } from '@/lib/location-repo';
import { listRecentPlatformChecks } from '@/lib/weather-snapshot-repo';
import { fetchWeatherForScope } from '@/lib/weather-fetch-orchestrator';
import { buildCityId } from '@/lib/utils';

const SHOWCASE_LIMIT = 4;

async function hydrateShowcaseCities() {
  const results = [];

  for (const city of PLATFORM_SHOWCASE_CITIES.slice(0, SHOWCASE_LIMIT)) {
    try {
      const response = await fetchWeatherForScope(city.lat, city.lon, 'current', {
        trigger: WEATHER_CHECK_TRIGGERS.showcaseHydrate,
      });
      results.push({
        lat: city.lat,
        lon: city.lon,
        fetchedAt: response.meta.fetchedAt,
        source: response.meta.source,
        temperature: response.data.temperature,
        description: response.data.description,
        condition: response.data.condition,
        icon: response.data.icon,
        cityName: city.name,
        country: city.country,
        cityId: buildCityId(city.name, city.country, city.lat),
      });
    } catch {
      results.push({
        lat: city.lat,
        lon: city.lon,
        fetchedAt: new Date().toISOString(),
        cityName: city.name,
        country: city.country,
        cityId: buildCityId(city.name, city.country, city.lat),
      });
    }
  }

  return results;
}

function withCityIds(checks) {
  return checks.map((check) => ({
    ...check,
    cityId: check.cityName
      ? buildCityId(check.cityName, check.country ?? 'XX', check.lat)
      : `location-${check.lat.toFixed(4)}-${check.lon.toFixed(4)}`,
  }));
}

/**
 * Server-side recent checks for RSC and `/api/recent-checks`.
 */
export async function getRecentChecksPayload() {
  const fromLocations = withCityIds(listRecentLocationChecks(20));

  const fromDb = fromLocations.length > 0
    ? fromLocations
    : withCityIds(listRecentPlatformChecks(20));

  const checks = fromDb.length > 0 ? fromDb : await hydrateShowcaseCities();

  return {
    checks,
    source: fromDb.length > 0 ? 'platform' : 'showcase',
  };
}
