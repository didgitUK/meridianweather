export const PLATFORM_SHOWCASE_CITIES = [
  { name: 'London', country: 'GB', state: 'England', lat: 51.5073, lon: -0.1276 },
  { name: 'Dubai', country: 'AE', lat: 25.2048, lon: 55.2708 },
  { name: 'New York', country: 'US', state: 'NY', lat: 40.7128, lon: -74.006 },
  { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
  { name: 'Sydney', country: 'AU', state: 'NSW', lat: -33.8688, lon: 151.2093 },
];

/**
 * When true, home also renders ads + journal teaser below the core grid.
 * Default off so the interview demo path stays search → pin → cards.
 * Set NEXT_PUBLIC_SHOW_HOME_STRETCH=1 to restore the stretch sections.
 */
export const SHOW_HOME_STRETCH_SECTIONS =
  process.env.NEXT_PUBLIC_SHOW_HOME_STRETCH === '1';

/**
 * Fresh installs show showcase cities in the popular-searches strip until real
 * search traffic exists. Set NEXT_PUBLIC_SHOW_DEMO_POPULAR_SEARCHES=0 to disable.
 */
export const SHOW_DEMO_POPULAR_SEARCHES =
  process.env.NEXT_PUBLIC_SHOW_DEMO_POPULAR_SEARCHES !== '0';

export const AD_PLACEMENTS = {
  dashboard: 'dashboard',
  hero: 'hero',
  recentChecks: 'recent-checks',
  cityDetail: 'city-detail',
};
