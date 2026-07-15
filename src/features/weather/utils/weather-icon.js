/** Maps OpenWeather icon codes to Meteocons static fill icon names. */
export const OPENWEATHER_TO_METEOCON = {
  '01d': 'clear-day',
  '01n': 'clear-night',
  '02d': 'partly-cloudy-day',
  '02n': 'partly-cloudy-night',
  '03d': 'cloudy',
  '03n': 'cloudy',
  '04d': 'overcast-day',
  '04n': 'overcast-night',
  '09d': 'overcast-day-rain',
  '09n': 'overcast-night-rain',
  '10d': 'partly-cloudy-day-rain',
  '10n': 'partly-cloudy-night-rain',
  '11d': 'thunderstorms-day',
  '11n': 'thunderstorms-night',
  '13d': 'overcast-day-snow',
  '13n': 'overcast-night-snow',
  '50d': 'fog-day',
  '50n': 'fog-night',
};

const FALLBACK_ICON = 'cloudy';

/** Colored Meteocon names used by metric / detail UI tiles. */
export const METRIC_METEOCON = Object.freeze({
  temperature: 'thermometer',
  feelsLike: 'thermometer-sun',
  humidity: 'humidity',
  pressure: 'barometer',
  dewPoint: 'thermometer-water',
  uvi: 'uv-index',
  clouds: 'cloudy',
  /** Fog bands — not the near-identical sun/horizon set used for rise/set. */
  visibility: 'fog',
  wind: 'wind',
  windGust: 'windsock',
  rain: 'raindrop',
  snow: 'snowflake',
  /** Full sun vs night sky so rise/set stay distinct at tile size. */
  sunrise: 'clear-day',
  sunset: 'starry-night',
  coordinates: 'compass',
  timezone: 'time-afternoon',
});

export function openWeatherIconToMeteocon(iconCode) {
  if (!iconCode) {
    return FALLBACK_ICON;
  }

  const normalized = iconCode.replace('@2x', '').trim().toLowerCase();

  return OPENWEATHER_TO_METEOCON[normalized] ?? FALLBACK_ICON;
}

export function getWeatherIconPath(iconCode) {
  return `/weather-icons/${openWeatherIconToMeteocon(iconCode)}.svg`;
}

export function getMeteoconPath(name) {
  if (!name || typeof name !== 'string') {
    return `/weather-icons/${FALLBACK_ICON}.svg`;
  }

  return `/weather-icons/${name}.svg`;
}

export const METEOCON_ICON_NAMES = [
  ...new Set([
    ...Object.values(OPENWEATHER_TO_METEOCON),
    ...Object.values(METRIC_METEOCON),
    FALLBACK_ICON,
  ]),
];
