/** AdSense Management API report ranges and metric keys. */

export const ADSENSE_REPORT_RANGES = {
  '7d': { id: '7d', label: 'Last 7 days', days: 7 },
  '30d': { id: '30d', label: 'Last 30 days', days: 30 },
  mtd: { id: 'mtd', label: 'Month to date', days: null },
};

export const ADSENSE_DEFAULT_RANGE = '30d';

export const ADSENSE_REPORT_STALE_MS = 6 * 60 * 60 * 1000;

export const ADSENSE_OAUTH_SCOPE = 'https://www.googleapis.com/auth/adsense.readonly';

export const ADSENSE_OAUTH_STATE_COOKIE = 'meridian_adsense_oauth_state';

export const ADSENSE_DATE_METRICS = [
  'ESTIMATED_EARNINGS',
  'CLICKS',
  'IMPRESSIONS',
  'PAGE_VIEWS_CTR',
  'COST_PER_CLICK',
  'IMPRESSION_RPM',
  'ACTIVE_VIEW_VIEWABILITY',
  'AD_REQUESTS',
];

export const ADSENSE_SNAPSHOT_KINDS = {
  DATE: 'DATE',
  PAGE_URL: 'PAGE_URL',
  PLATFORM_TYPE_NAME: 'PLATFORM_TYPE_NAME',
  COUNTRY_NAME: 'COUNTRY_NAME',
  ACCOUNT: 'ACCOUNT',
};
