export const weatherIconsDoc = {
  slug: 'weather-icons',
  title: 'Weather icons',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'source',
      title: 'Icon set',
      body:
        'meridian uses Meteocons (MIT, Bas Milius) fill-style static SVGs instead of OpenWeather CDN PNGs. Icons live in public/weather-icons/ and are copied from @meteocons/svg-static on npm install (postinstall) or via npm run copy:icons. Attribution in public/weather-icons/ATTRIBUTION.txt.',
    },
    {
      id: 'inventory',
      title: 'Shipped icons',
      body:
        'scripts/copy-weather-icons.mjs copies 35 unique SVGs: 17 OpenWeather condition icons plus metric/detail tiles (thermometer, humidity, barometer, wind, UV, raindrop, snowflake, compass, starry-night, time-afternoon, and related variants). Count files under public/weather-icons/*.svg after copy:icons.',
    },
    {
      id: 'mapping',
      title: 'OpenWeather code mapping',
      body:
        'OpenWeather icon codes (e.g. 01d, 10n) map to Meteocon names in src/features/weather/utils/weather-icon.js: 01d→clear-day, 01n→clear-night, 02d→partly-cloudy-day, 02n→partly-cloudy-night, 03d/03n→cloudy, 04d→overcast-day, 04n→overcast-night, 09d→overcast-day-rain, 09n→overcast-night-rain, 10d→partly-cloudy-day-rain, 10n→partly-cloudy-night-rain, 11d→thunderstorms-day, 11n→thunderstorms-night, 13d→overcast-day-snow, 13n→overcast-night-snow, 50d→fog-day, 50n→fog-night. Unknown codes fall back to cloudy. METRIC_METEOCON maps detail-tile keys to additional icons.',
    },
    {
      id: 'component',
      title: 'WeatherIcon component',
      body:
        'src/features/weather/components/WeatherIcon.jsx wraps getWeatherIconPath(icon) for local /weather-icons/{name}.svg. Used on weather cards, recent checks, forecast strips, hourly chart, daily rows, and city detail metric tiles. Alt text uses weather description when provided.',
    },
    {
      id: 'maintenance',
      title: 'Adding or updating icons',
      body:
        'Edit OPENWEATHER_TO_METEOCON / METRIC_METEOCON in weather-icon.js and ICON_NAMES in scripts/copy-weather-icons.mjs, then npm run copy:icons. Vitest tests in weather-icon.test.js verify mapping.',
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      body:
        'Icons are decorative supplements to text descriptions (e.g. “Clear sky”). WeatherIcon sets alt from description prop; empty alt when used alongside visible condition text only.',
    },
  ],
};
