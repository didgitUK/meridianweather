export const REDUCED_MOTION_OPTIONS = [
  { value: 'system', label: 'Use system setting' },
  { value: 'reduce', label: 'Reduce motion' },
  { value: 'no-preference', label: 'Full motion' },
];

export const COLOR_SCHEME_OPTIONS = [
  { value: 'system', label: 'System default' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export const FONT_SCALE_OPTIONS = [
  { value: 100, label: 'Default (100%)' },
  { value: 110, label: 'Large (110%)' },
  { value: 125, label: 'Extra large (125%)' },
  { value: 150, label: 'Maximum (150%)' },
];

export const DEFAULT_ACCESSIBILITY_PREFERENCES = {
  reducedMotion: 'system',
  highContrast: false,
  fontScale: 100,
  underlineLinks: false,
  enhancedFocus: false,
  readableFont: false,
  showSkipLink: true,
};
