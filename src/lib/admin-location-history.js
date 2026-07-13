import { buildLocationHistoryInsights } from '@/lib/location-history-analytics';
import { getLocationSummary, listLocationChecks } from '@/lib/location-repo';
import { getForecastArchiveCount } from '@/lib/location-history-seed';
import {
  getWeatherHistorySummary,
  listWeatherObservations,
} from '@/lib/weather-history-repo';

export function getAdminLocationHistoryDetail(locationId) {
  const location = getLocationSummary(locationId);
  if (!location) {
    return null;
  }

  const observations = listWeatherObservations(location.lat, location.lon, { limit: 500 });
  const checks = listLocationChecks(locationId, { limit: 50 });
  const historySummary = getWeatherHistorySummary(location.lat, location.lon);
  const archiveCount = getForecastArchiveCount(location.lat, location.lon);

  return {
    location,
    historySummary: {
      ...historySummary,
      archiveCount,
    },
    insights: buildLocationHistoryInsights({ observations }),
    observations: observations.slice(0, 30),
    checks: checks.slice(0, 30),
  };
}
