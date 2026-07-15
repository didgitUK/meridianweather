export const CITY_DETAIL_CURRENT_CONDITIONS_ID = 'current-conditions';

export const CITY_DETAIL_ACCORDION_LOCATION = 'location';
export const CITY_DETAIL_ACCORDION_SUN_TIMES = 'sun-times';
export const CITY_DETAIL_ACCORDION_CONDITIONS = CITY_DETAIL_CURRENT_CONDITIONS_ID;

/** Forecast tabs on the city detail page (data we already fetch). */
export const CITY_DETAIL_TAB_IDS = Object.freeze({
  today: 'today',
  hourly: 'hourly',
  daily: 'daily',
  history: 'history',
});

export const CITY_DETAIL_TABS = Object.freeze([
  { id: CITY_DETAIL_TAB_IDS.today, label: 'Today' },
  { id: CITY_DETAIL_TAB_IDS.hourly, label: 'Hourly' },
  { id: CITY_DETAIL_TAB_IDS.daily, label: '10-Day' },
  { id: CITY_DETAIL_TAB_IDS.history, label: 'History' },
]);

export const CITY_DETAIL_DEFAULT_TAB = CITY_DETAIL_TAB_IDS.today;

/** Legacy deep-link id → default tab. */
const LEGACY_TAB_ALIASES = Object.freeze({
  'next-hour': CITY_DETAIL_DEFAULT_TAB,
});

/**
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeCityDetailTab(value) {
  if (typeof value !== 'string') {
    return CITY_DETAIL_DEFAULT_TAB;
  }

  if (LEGACY_TAB_ALIASES[value]) {
    return LEGACY_TAB_ALIASES[value];
  }

  const match = CITY_DETAIL_TABS.find((tab) => tab.id === value);
  return match ? match.id : CITY_DETAIL_DEFAULT_TAB;
}
