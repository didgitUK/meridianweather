import { DEFAULT_ACCESSIBILITY_PREFERENCES } from '@/constants/accessibility';
import { STORAGE_KEYS } from '@/constants/storage-keys';

const FONT_SCALE_VALUES = new Set([100, 110, 125, 150]);

export function readAccessibilityPreferencesRaw() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(STORAGE_KEYS.accessibility) ?? '';
}

export function parseAccessibilityPreferences(raw = readAccessibilityPreferencesRaw()) {
  if (!raw) {
    return DEFAULT_ACCESSIBILITY_PREFERENCES;
  }

  try {
    const parsed = JSON.parse(raw);
    const fontScale = Number(parsed.fontScale);

    return {
      ...DEFAULT_ACCESSIBILITY_PREFERENCES,
      ...parsed,
      fontScale: FONT_SCALE_VALUES.has(fontScale) ? fontScale : DEFAULT_ACCESSIBILITY_PREFERENCES.fontScale,
    };
  } catch {
    return DEFAULT_ACCESSIBILITY_PREFERENCES;
  }
}

export function resolveReducedMotionPreference(preferences = DEFAULT_ACCESSIBILITY_PREFERENCES) {
  if (preferences.reducedMotion === 'reduce') {
    return true;
  }

  if (preferences.reducedMotion === 'no-preference') {
    return false;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function resolveColorSchemePreference(theme = 'system') {
  if (theme === 'light' || theme === 'dark') {
    return theme;
  }

  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyAccessibilityDocumentState({
  preferences,
  resolvedTheme,
}) {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;

  root.classList.toggle('dark', resolvedTheme === 'dark');
  root.classList.toggle('light', resolvedTheme === 'light');
  root.classList.toggle('a11y-high-contrast', preferences.highContrast);
  root.classList.toggle('a11y-underline-links', preferences.underlineLinks);
  root.classList.toggle('a11y-enhanced-focus', preferences.enhancedFocus);
  root.classList.toggle('a11y-readable-font', preferences.readableFont);
  root.classList.toggle('a11y-reduced-motion', resolveReducedMotionPreference(preferences));
  root.style.setProperty('--a11y-font-scale', String(preferences.fontScale / 100));
}
