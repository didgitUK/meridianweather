export const accessibilityPolicy = {
  slug: 'accessibility',
  title: 'Accessibility Statement',
  lastUpdated: '2026-07-09',
  sections: [
    {
      id: 'commitment',
      title: 'Our commitment',
      body:
        'meridian targets WCAG 2.1 AA with semantic HTML, keyboard support, visible focus states, labelled controls, and reduced-motion friendly styling via design tokens.',
    },
    {
      id: 'features',
      title: 'Implemented features',
      body:
        'Landmark structure (header, main, footer), labelled city search with aria-live results, theme toggle with aria-label, dialog focus traps (subscribe, remove city, admin usage, privacy preferences), cookie banner as dialog, complementary ad placeholders, font contrast in light and dark themes, tabular numbers for temperatures.',
    },
    {
      id: 'icons',
      title: 'Weather icons',
      body:
        'Local Meteocons SVG icons supplement text condition descriptions (e.g. “Clear sky”). WeatherIcon uses description as alt text when provided. Icons are not the sole indicator of conditions.',
    },
    {
      id: 'gaps',
      title: 'Known gaps',
      body:
        'Hourly and minutely charts are primarily visual scroll regions. Premium upgrade button is disabled without alternative flow. Some forecast rows use icon with adjacent text only. Third-party AdSense content is not controlled by meridian when enabled.',
    },
  ],
};
