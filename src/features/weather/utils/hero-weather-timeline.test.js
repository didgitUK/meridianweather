import { describe, expect, it } from 'vitest';
import { resolveHomeWeatherScopes } from '@/features/cities/utils/home-weather-scopes';
import {
  HERO_NIGHT_WASH_MAX,
  buildHeroTimelineLabels,
  clampHeroHourIndex,
  currentAsTimelinePoint,
  dayNightWashStrength,
  disabledTheaterFrame,
  frameDiurnalState,
  frameOverlayOpacities,
  heroTimelineIdentity,
  lerpTheaterFrame,
  selectHeroTimelineHours,
  solarNightStrength,
  theaterFrameAtIndex,
  buildHeroSolarMarkers,
  timelineDtAtIndex,
  timelineIndexAtDt,
} from '@/features/weather/utils/hero-weather-timeline';

describe('resolveHomeWeatherScopes', () => {
  it('includes hourly only when requested', () => {
    expect(resolveHomeWeatherScopes(false)).toEqual(['current']);
    expect(resolveHomeWeatherScopes(true)).toEqual(['current', 'hourly']);
  });
});

describe('frameOverlayOpacities', () => {
  it('scales cloud opacity from cloud cover', () => {
    const clear = frameOverlayOpacities({ clouds: 0 });
    const overcast = frameOverlayOpacities({ clouds: 100 });
    expect(clear.cloudOpacity).toBeLessThan(overcast.cloudOpacity);
    expect(clear.precipOpacity).toBe(0);
  });

  it('raises precip opacity from pop and intensity', () => {
    const dry = frameOverlayOpacities({ clouds: 40, pop: 0 });
    const wet = frameOverlayOpacities({ clouds: 40, pop: 0.8, precipitation: 2 });
    expect(wet.precipOpacity).toBeGreaterThan(dry.precipOpacity);
  });

  it('keeps opacities within 0–1', () => {
    const frame = frameOverlayOpacities({ clouds: 100, pop: 1, precipitation: 20 });
    expect(frame.cloudOpacity).toBeGreaterThanOrEqual(0);
    expect(frame.cloudOpacity).toBeLessThanOrEqual(1);
    expect(frame.precipOpacity).toBeGreaterThanOrEqual(0);
    expect(frame.precipOpacity).toBeLessThanOrEqual(1);
  });
});

describe('solarNightStrength', () => {
  const sunrise = 1_700_000_000;
  const sunset = sunrise + 12 * 3600;

  it('is full night at midnight midpoint', () => {
    const midnight = sunset + 4 * 3600;
    expect(solarNightStrength(midnight, sunrise, sunset)).toBe(1);
  });

  it('is full day at solar noon', () => {
    const noon = sunrise + 6 * 3600;
    expect(solarNightStrength(noon, sunrise, sunset)).toBe(0);
  });

  it('eases through dawn and dusk (not binary)', () => {
    const dawnMid = sunrise;
    const duskMid = sunset;
    const dawn = solarNightStrength(dawnMid, sunrise, sunset);
    const dusk = solarNightStrength(duskMid, sunrise, sunset);
    expect(dawn).toBeGreaterThan(0.2);
    expect(dawn).toBeLessThan(0.8);
    expect(dusk).toBeGreaterThan(0.2);
    expect(dusk).toBeLessThan(0.8);
  });
});

describe('dayNightWashStrength', () => {
  it('treats night icons as dark when solar missing', () => {
    expect(dayNightWashStrength({ icon: '01n' })).toBeGreaterThan(0.5);
  });

  it('treats day icons as bright when solar missing', () => {
    expect(dayNightWashStrength({ icon: '01d', uvi: 5 })).toBeLessThan(0.2);
  });

  it('stays within 0–washMax', () => {
    expect(dayNightWashStrength({ icon: '01n' })).toBeLessThanOrEqual(HERO_NIGHT_WASH_MAX);
    expect(dayNightWashStrength({ icon: '01d', uvi: 8 })).toBeGreaterThanOrEqual(0);
  });

  it('uses continuous solar curve when sunrise/sunset provided', () => {
    const sunrise = 1_700_000_000;
    const sunset = sunrise + 12 * 3600;
    const noon = dayNightWashStrength(
      { dt: sunrise + 6 * 3600, icon: '01n' },
      { sunrise, sunset },
    );
    const night = dayNightWashStrength(
      { dt: sunset + 3 * 3600, icon: '01d' },
      { sunrise, sunset },
    );
    expect(noon).toBeLessThan(0.05);
    expect(night).toBeCloseTo(HERO_NIGHT_WASH_MAX, 2);
  });
});

describe('frameDiurnalState', () => {
  const sunrise = 1_700_000_000;
  const sunset = sunrise + 12 * 3600;
  const solar = { sunrise, sunset };

  it('peaks lights at clear night and zeroes by day', () => {
    const night = frameDiurnalState(
      { dt: sunset + 3 * 3600, clouds: 0 },
      solar,
    );
    const day = frameDiurnalState(
      { dt: sunrise + 6 * 3600, clouds: 0 },
      solar,
    );
    expect(night.lights).toBeGreaterThan(0.7);
    expect(day.lights).toBe(0);
    expect(night.wash).toBeGreaterThan(day.wash);
  });

  it('attenuates lights under overcast vs clear night', () => {
    const clear = frameDiurnalState(
      { dt: sunset + 3 * 3600, clouds: 0 },
      solar,
    );
    const overcast = frameDiurnalState(
      { dt: sunset + 3 * 3600, clouds: 100 },
      solar,
    );
    expect(overcast.lights).toBeLessThan(clear.lights);
    expect(overcast.lights).toBeGreaterThan(0);
  });
});

describe('lerpTheaterFrame / theaterFrameAtIndex', () => {
  const sunrise = 1_700_000_000;
  const sunset = sunrise + 12 * 3600;
  const solar = { sunrise, sunset };

  it('lerps wash and lights between adjacent hours', () => {
    const a = { dt: sunset - 3600, clouds: 0 };
    const b = { dt: sunset + 3600, clouds: 0 };
    const mid = lerpTheaterFrame(a, b, 0.5, solar);
    const fa = lerpTheaterFrame(a, b, 0, solar);
    const fb = lerpTheaterFrame(a, b, 1, solar);
    expect(mid.wash).toBeGreaterThan(fa.wash);
    expect(mid.wash).toBeLessThan(fb.wash);
    expect(mid.lights).toBeGreaterThan(fa.lights);
    expect(mid.lights).toBeLessThan(fb.lights);
  });

  it('resolves float hour index on a timeline', () => {
    const hours = [
      { dt: sunrise + 6 * 3600, clouds: 0 },
      { dt: sunset + 2 * 3600, clouds: 0 },
    ];
    const frame = theaterFrameAtIndex(hours, 0.5, null, solar);
    expect(frame.wash).toBeGreaterThan(0.2);
    expect(frame.lights).toBeGreaterThan(0.2);
    expect(frame).toHaveProperty('cloudOpacity');
  });
});

describe('timelineDtAtIndex', () => {
  it('interpolates timestamps for float scrub', () => {
    const hours = [{ dt: 1000 }, { dt: 2000 }];
    expect(timelineDtAtIndex(hours, 0.5)).toBe(1500);
  });
});

describe('timelineIndexAtDt', () => {
  it('returns float index for a timestamp in the window', () => {
    const hours = [{ dt: 1000 }, { dt: 2000 }, { dt: 3000 }];
    expect(timelineIndexAtDt(hours, 1500)).toBe(0.5);
    expect(timelineIndexAtDt(hours, 2500)).toBe(1.5);
  });

  it('returns null outside the window', () => {
    const hours = [{ dt: 1000 }, { dt: 2000 }];
    expect(timelineIndexAtDt(hours, 500)).toBeNull();
    expect(timelineIndexAtDt(hours, 2500)).toBeNull();
  });
});

describe('buildHeroSolarMarkers', () => {
  it('places sunrise and sunset inside a spanning window', () => {
    const sunrise = 1_700_000_000;
    const sunset = sunrise + 12 * 3600;
    const hours = Array.from({ length: 24 }, (_, i) => ({
      dt: sunrise - 2 * 3600 + i * 3600,
    }));
    const markers = buildHeroSolarMarkers(hours, { sunrise, sunset }, {
      formatHour: (dt) => String(dt),
    });
    expect(markers.some((m) => m.kind === 'sunrise')).toBe(true);
    expect(markers.some((m) => m.kind === 'sunset')).toBe(true);
    expect(markers.every((m) => m.index >= 0 && m.index <= 23)).toBe(true);
  });

  it('clips markers outside the timeline window', () => {
    const sunrise = 1_700_000_000;
    const sunset = sunrise + 12 * 3600;
    // Window entirely after sunset, before next sunrise
    const hours = Array.from({ length: 6 }, (_, i) => ({
      dt: sunset + 3600 + i * 3600,
    }));
    const markers = buildHeroSolarMarkers(hours, { sunrise, sunset });
    expect(markers).toHaveLength(0);
  });
});

describe('buildHeroTimelineLabels', () => {
  it('labels start, every 6h, and end across 24 hours', () => {
    const now = Math.floor(Date.now() / 1000);
    const hours = Array.from({ length: 24 }, (_, i) => ({ dt: now + i * 3600 }));
    const labels = buildHeroTimelineLabels(hours, {
      formatHour: (dt) => String(dt),
    });
    expect(labels.map((row) => row.index)).toEqual([0, 6, 12, 18, 23]);
  });
});

describe('selectHeroTimelineHours', () => {
  it('returns up to 24 upcoming hours', () => {
    const now = Math.floor(Date.now() / 1000);
    const points = Array.from({ length: 40 }, (_, i) => ({
      dt: now + i * 3600,
      clouds: i * 3,
    }));
    expect(selectHeroTimelineHours(points)).toHaveLength(24);
  });
});

describe('currentAsTimelinePoint', () => {
  it('maps current weather fields', () => {
    expect(currentAsTimelinePoint({
      clouds: 12,
      icon: '01d',
      rain1h: 0,
      updatedAt: 100,
    })).toMatchObject({ clouds: 12, icon: '01d', dt: 100 });
  });
});

describe('heroTimelineIdentity', () => {
  it('is stable for the same window', () => {
    const a = [{ dt: 100 }, { dt: 200 }];
    const b = [{ dt: 100 }, { dt: 200 }];
    expect(heroTimelineIdentity(a)).toBe(heroTimelineIdentity(b));
  });

  it('changes when the window shifts', () => {
    expect(heroTimelineIdentity([{ dt: 100 }, { dt: 200 }]))
      .not.toBe(heroTimelineIdentity([{ dt: 1600 }, { dt: 200 }]));
  });
});

describe('clampHeroHourIndex', () => {
  it('clamps into range without rounding floats', () => {
    expect(clampHeroHourIndex(-2, 24)).toBe(0);
    expect(clampHeroHourIndex(30, 24)).toBe(23);
    expect(clampHeroHourIndex(5.6, 24)).toBe(5.6);
  });

  it('handles empty timelines', () => {
    expect(clampHeroHourIndex(3, 0)).toBe(0);
  });
});

describe('disabledTheaterFrame', () => {
  it('returns a static wash frame with lights off', () => {
    const frame = disabledTheaterFrame();
    expect(frame.cloudOpacity).toBeGreaterThan(0);
    expect(frame.wash).toBeGreaterThanOrEqual(0);
    expect(frame.wash).toBeLessThanOrEqual(1);
    expect(frame.lights).toBe(0);
  });
});
