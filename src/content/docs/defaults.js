import { gettingStartedDoc } from '@/content/docs/getting-started';
import { dashboardDoc } from '@/content/docs/dashboard';
import { cityDetailDoc } from '@/content/docs/city-detail';
import { forecastsDoc } from '@/content/docs/forecasts';
import { recentChecksDoc } from '@/content/docs/recent-checks';
import { subscriptionsDoc } from '@/content/docs/subscriptions';
import { apiLimitsDoc } from '@/content/docs/api-limits';
import { monetizationDoc } from '@/content/docs/monetization';
import { apiReferenceDoc } from '@/content/docs/api-reference';
import { weatherIconsDoc } from '@/content/docs/weather-icons';
import { deploymentDoc } from '@/content/docs/deployment';

/** File-backed defaults used to seed and reset CMS documentation pages. User-first order. */
export const DOCS_PAGES = [
  gettingStartedDoc,
  dashboardDoc,
  cityDetailDoc,
  subscriptionsDoc,
  monetizationDoc,
  weatherIconsDoc,
  recentChecksDoc,
  forecastsDoc,
  apiLimitsDoc,
  apiReferenceDoc,
  deploymentDoc,
];

export {
  gettingStartedDoc,
  dashboardDoc,
  cityDetailDoc,
  forecastsDoc,
  recentChecksDoc,
  subscriptionsDoc,
  apiLimitsDoc,
  monetizationDoc,
  apiReferenceDoc,
  weatherIconsDoc,
  deploymentDoc,
};
