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

export const METEOCON_ICON_NAMES = [
  ...new Set([...Object.values(OPENWEATHER_TO_METEOCON), FALLBACK_ICON]),
];
