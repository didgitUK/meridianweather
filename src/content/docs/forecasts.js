export const forecastsDoc = {
  slug: 'forecasts',
  title: 'Forecasts & refresh',
  lastUpdated: '2026-08-01',
  sections: [
    {
      id: 'overview',
      title: 'How forecasts stay current',
      body:
        'meridian shows live conditions, hourly detail, and a longer outlook powered by OpenWeather. To keep the free upstream quota healthy, the site remembers recent readings in your browser (when you allow Functional storage) and reuses shared server cache so every click does not force a brand-new provider call.',
    },
    {
      id: 'tabs',
      title: 'What you can read',
      body:
        'City and place pages organise the same feed into clear tabs:\n\n• Today — current conditions and quick facts\n• Hourly — the next hours (a densified short strip for planning)\n• 10-Day — the longer outlook, with confidence fading further out\n• History — past days when we have stored them\n\nUse hourly detail when plans are close; treat the far end of a 10-day view as a direction of travel.',
    },
    {
      id: 'refresh',
      title: 'Refreshing a place',
      body:
        'Pinned home cards prefer the last reading saved on this device. Use refresh on a card (or reopen a city page) when you want a fresher check. New places without a saved reading fetch automatically.',
    },
    {
      id: 'honesty',
      title: 'Limits and honesty',
      body:
        'Consumer forecasts are imperfect. Near-term hours are usually more reliable than day nine. meridian stays honest about free-tier upstream windows and does not invent a separate climate model. For safety-critical decisions, follow official meteorological and emergency services guidance.',
    },
  ],
};
