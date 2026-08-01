export const weatherIconsDoc = {
  slug: 'weather-icons',
  title: 'Weather icons',
  lastUpdated: '2026-08-01',
  sections: [
    {
      id: 'source',
      title: 'What the icons are',
      body:
        'Weather pictures on cards and forecasts are clear line/fill icons (Meteocons by Bas Milius, MIT licence). They show sunny, cloudy, rain, snow, fog, and similar conditions next to the written description — the text still carries the meaning if an image fails to load.',
    },
    {
      id: 'mapping',
      title: 'How icons map to forecasts',
      body:
        'OpenWeather condition codes are mapped to Meridian’s local Meteocon assets so the same sunny, rain, or fog meaning stays consistent across the dashboard, city pages, and journal imagery callouts.',
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      body:
        'Icons support the words on screen. Where a condition description is visible, the image is treated as decorative; otherwise a short text alternative is provided from the description.',
    },
  ],
};
