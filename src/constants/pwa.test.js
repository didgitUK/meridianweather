import { describe, expect, it } from 'vitest';
import { normalizePwaNotifyMode, PWA_NOTIFY_MODES } from '@/constants/pwa';

describe('normalizePwaNotifyMode', () => {
  it('defaults unknown values to daily', () => {
    expect(normalizePwaNotifyMode(null)).toBe(PWA_NOTIFY_MODES.daily);
    expect(normalizePwaNotifyMode('nope')).toBe(PWA_NOTIFY_MODES.daily);
  });

  it('accepts known modes', () => {
    expect(normalizePwaNotifyMode('severe')).toBe(PWA_NOTIFY_MODES.severe);
    expect(normalizePwaNotifyMode('both')).toBe(PWA_NOTIFY_MODES.both);
    expect(normalizePwaNotifyMode('daily')).toBe(PWA_NOTIFY_MODES.daily);
  });
});
