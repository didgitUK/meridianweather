import { describe, expect, it } from 'vitest';
import {
  areAllAlertPrefsEnabled,
  createAllAlertPrefs,
  hasAnyAlertPrefEnabled,
} from '@/constants/alert-types';
import {
  ALERT_PREF_MODES,
  buildInitialAlertPrefs,
} from '@/features/subscriptions/components/SubscribeAlertPrefs';

function resolveAlertPrefsForSave(mode, prefs) {
  if (mode === ALERT_PREF_MODES.all) {
    return createAllAlertPrefs();
  }
  return prefs;
}

describe('SubscribeAlertPrefs helpers', () => {
  it('builds initial prefs from existing or all-on defaults', () => {
    const fromExisting = buildInitialAlertPrefs({ rain: true, thunderstorm: false });
    expect(fromExisting.rain).toBe(true);
    expect(fromExisting.thunderstorm).toBe(false);

    const fromEmpty = buildInitialAlertPrefs(null);
    expect(areAllAlertPrefsEnabled(fromEmpty)).toBe(true);
  });

  it('resolves all-mode saves to every type enabled', () => {
    const partial = buildInitialAlertPrefs({ rain: true });
    const saved = resolveAlertPrefsForSave(ALERT_PREF_MODES.all, partial);
    expect(areAllAlertPrefsEnabled(saved)).toBe(true);
    expect(hasAnyAlertPrefEnabled(saved)).toBe(true);
  });

  it('keeps custom prefs on custom-mode save', () => {
    const custom = { ...createAllAlertPrefs(), rain: false, snow: true };
    const saved = resolveAlertPrefsForSave(ALERT_PREF_MODES.custom, custom);
    expect(saved.rain).toBe(false);
    expect(saved.snow).toBe(true);
  });
});
