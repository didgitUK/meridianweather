/** OpenWeather condition ID groups (https://openweathermap.org/weather-conditions). */
export const WEATHER_CATEGORY = {
  THUNDERSTORM: 'thunderstorm',
  DRIZZLE: 'drizzle',
  RAIN: 'rain',
  SNOW: 'snow',
  ATMOSPHERIC: 'atmospheric',
  CLEAR: 'clear',
  CLOUDS: 'clouds',
  EXTREME: 'extreme',
  UNKNOWN: 'unknown',
};

/**
 * @param {number | string | null | undefined} weatherId
 * @returns {typeof WEATHER_CATEGORY[keyof typeof WEATHER_CATEGORY]}
 */
export function getWeatherCategory(weatherId) {
  const id = Number(weatherId);

  if (!Number.isFinite(id)) {
    return WEATHER_CATEGORY.UNKNOWN;
  }

  if (id >= 200 && id <= 232) {
    return WEATHER_CATEGORY.THUNDERSTORM;
  }

  if (id >= 300 && id <= 321) {
    return WEATHER_CATEGORY.DRIZZLE;
  }

  if (id >= 500 && id <= 531) {
    return WEATHER_CATEGORY.RAIN;
  }

  if (id >= 600 && id <= 622) {
    return WEATHER_CATEGORY.SNOW;
  }

  if (id >= 701 && id <= 781) {
    return WEATHER_CATEGORY.ATMOSPHERIC;
  }

  if (id === 800) {
    return WEATHER_CATEGORY.CLEAR;
  }

  if (id >= 801 && id <= 804) {
    return WEATHER_CATEGORY.CLOUDS;
  }

  if (id === 900) {
    return WEATHER_CATEGORY.EXTREME;
  }

  return WEATHER_CATEGORY.UNKNOWN;
}

function iconPrefix(iconCode) {
  if (!iconCode) {
    return null;
  }

  return iconCode.replace('@2x', '').trim().toLowerCase().slice(0, 2);
}

/**
 * @param {number | string | null | undefined} weatherId
 * @param {string | null | undefined} [iconCode]
 */
export function isRainAlertWeather(weatherId, iconCode = null) {
  const category = getWeatherCategory(weatherId);

  if (category === WEATHER_CATEGORY.DRIZZLE || category === WEATHER_CATEGORY.RAIN) {
    return true;
  }

  if (category !== WEATHER_CATEGORY.UNKNOWN) {
    return false;
  }

  const prefix = iconPrefix(iconCode);
  return prefix === '09' || prefix === '10';
}

/**
 * @param {number | string | null | undefined} weatherId
 * @param {string | null | undefined} [iconCode]
 */
export function isStormAlertWeather(weatherId, iconCode = null) {
  const category = getWeatherCategory(weatherId);

  if (category === WEATHER_CATEGORY.THUNDERSTORM) {
    return true;
  }

  if (category !== WEATHER_CATEGORY.UNKNOWN) {
    return false;
  }

  return iconPrefix(iconCode) === '11';
}

/**
 * @param {number | string | null | undefined} weatherId
 * @param {string | null | undefined} [iconCode]
 */
export function isSnowAlertWeather(weatherId, iconCode = null) {
  const category = getWeatherCategory(weatherId);

  if (category === WEATHER_CATEGORY.SNOW) {
    return true;
  }

  if (category !== WEATHER_CATEGORY.UNKNOWN) {
    return false;
  }

  return iconPrefix(iconCode) === '13';
}
