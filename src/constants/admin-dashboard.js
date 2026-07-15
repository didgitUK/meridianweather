/** Secondary tabs inside the admin Dashboard (overview) hub. */

export const DASHBOARD_TAB_IDS = {
  analytics: 'analytics',
  api: 'api',
  emailLists: 'email-lists',
  adsense: 'adsense',
};

export const DASHBOARD_TABS = [
  {
    id: DASHBOARD_TAB_IDS.analytics,
    label: 'Analytics',
    description: 'Visitors, engagement, scroll depth, ad area views',
  },
  {
    id: DASHBOARD_TAB_IDS.api,
    label: 'API use',
    description: 'OpenWeather quota, checks, and cache behaviour',
  },
  {
    id: DASHBOARD_TAB_IDS.emailLists,
    label: 'Email lists',
    description: 'Newsletter, digests, and alert subscribers',
  },
  {
    id: DASHBOARD_TAB_IDS.adsense,
    label: 'AdSense income',
    description: 'Earnings, impressions, and top pages',
  },
];
