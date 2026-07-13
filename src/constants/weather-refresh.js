export const WEATHER_REFRESH_MODE = {
  MANUAL: 'manual',
  ON_RELOAD: 'on-reload',
};

export const DEFAULT_WEATHER_REFRESH_MODE = WEATHER_REFRESH_MODE.MANUAL;

export const WEATHER_REFRESH_MODE_OPTIONS = [
  {
    value: WEATHER_REFRESH_MODE.MANUAL,
    label: 'Manual only',
  },
  {
    value: WEATHER_REFRESH_MODE.ON_RELOAD,
    label: 'Refresh when page reloads',
  },
];

export function normalizeWeatherRefreshMode(value) {
  if (value === WEATHER_REFRESH_MODE.ON_RELOAD) {
    return WEATHER_REFRESH_MODE.ON_RELOAD;
  }

  return WEATHER_REFRESH_MODE.MANUAL;
}
