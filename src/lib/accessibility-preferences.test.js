import { describe, expect, it } from 'vitest';
import { DEFAULT_ACCESSIBILITY_PREFERENCES } from '@/constants/accessibility';
import {
  parseAccessibilityPreferences,
  resolveColorSchemePreference,
  resolveReducedMotionPreference,
} from '@/lib/accessibility-preferences';

describe('accessibility-preferences', () => {
  it('falls back to defaults for invalid json', () => {
    expect(parseAccessibilityPreferences('not-json')).toEqual(DEFAULT_ACCESSIBILITY_PREFERENCES);
  });

  it('sanitises font scale values', () => {
    expect(parseAccessibilityPreferences(JSON.stringify({ fontScale: 999 })).fontScale).toBe(100);
  });

  it('honours explicit reduced motion preference', () => {
    expect(
      resolveReducedMotionPreference({
        ...DEFAULT_ACCESSIBILITY_PREFERENCES,
        reducedMotion: 'reduce',
      }),
    ).toBe(true);
    expect(
      resolveReducedMotionPreference({
        ...DEFAULT_ACCESSIBILITY_PREFERENCES,
        reducedMotion: 'no-preference',
      }),
    ).toBe(false);
  });

  it('resolves explicit colour schemes', () => {
    expect(resolveColorSchemePreference('dark')).toBe('dark');
    expect(resolveColorSchemePreference('light')).toBe('light');
  });
});
