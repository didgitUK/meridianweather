export const weatherIconsDoc = {
  slug: 'weather-icons',
  title: 'Weather icons',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'source',
      title: 'What the icons are',
      body:
        'Weather pictures on cards and forecasts are clear line/fill icons (Meteocons by Bas Milius, MIT licence). They show sunny, cloudy, rain, snow, fog, and similar conditions next to the written description — the text still carries the meaning if an image fails to load.',
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      body:
        'Icons support the words on screen. Where a condition description is visible, the image is treated as decorative; otherwise a short text alternative is provided from the description.',
    },
    {
      id: 'operators',
      title: 'For site operators',
      body:
        'Assets live in public/weather-icons/ (about 35 SVG files in a typical checkout). scripts/copy-weather-icons.mjs copies 32 unique names from @meteocons/svg-static on postinstall / npm run copy:icons; a few extras (e.g. sunrise, sunset, horizon) may exist in the folder but map through METRIC_METEOCON aliases. Mapping: src/features/weather/utils/weather-icon.js (OPENWEATHER_TO_METEOCON). Component: WeatherIcon.jsx. Attribution: public/weather-icons/ATTRIBUTION.txt. Tests: weather-icon.test.js.',
    },
  ],
};
