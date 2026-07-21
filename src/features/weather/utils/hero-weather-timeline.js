import { selectNextHours } from '@/features/weather/utils/forecast-chart-series';

export const HERO_TIMELINE_HOURS = 24;
/** Wall-clock ms to advance one forecast hour during autoplay. */
export const HERO_TIMELINE_MS_PER_HOUR = 1000;

export const HERO_CLOUD_BASE_OPACITY = 0.72;
export const HERO_PRECIP_BASE_OPACITY = 0.45;

/** Full-night darken opacity (under city lights in Leaflet). */
export const HERO_NIGHT_WASH_MAX = 0.92;
/** Peak city-lights opacity on a clear night. */
export const HERO_LIGHTS_MAX = 0.95;
/** How much cloud cover dims lights (0–1). */
export const HERO_LIGHTS_CLOUD_ATTENUATION = 0.75;
/** Civil-style twilight window around sunrise/sunset (seconds). */
export const HERO_TWILIGHT_SECONDS = 75 * 60;

/**
 * Next 24 hourly points for the silent hero theater.
 * @param {Array<object>} hourlyPoints
 * @param {number} [count]
 */
export function selectHeroTimelineHours(hourlyPoints, count = HERO_TIMELINE_HOURS) {
  // Request one extra densified step so we usually retain a full 24-hour window.
  const window = selectNextHours(hourlyPoints, count + 1);
  return window.slice(0, count);
}

/**
 * Build visible time labels for the hero scrub (current → +24h).
 * Labels at index 0, every 6 hours, and the final hour.
 * @param {Array<{ dt?: number }>} hours
 * @param {{ timezone?: string | null, timezoneOffset?: number | null, formatHour?: (dt: number) => string }} [opts]
 */
export function buildHeroTimelineLabels(hours, {
  timezone = null,
  timezoneOffset = null,
  formatHour = null,
} = {}) {
  if (!hours?.length) {
    return [];
  }

  const last = hours.length - 1;
  const indexes = new Set([0, last]);
  for (let i = 6; i < last; i += 6) {
    indexes.add(i);
  }

  return [...indexes]
    .sort((a, b) => a - b)
    .map((index) => {
      const point = hours[index];
      const dt = Number(point?.dt);
      let label = '';
      if (Number.isFinite(dt) && typeof formatHour === 'function') {
        label = formatHour(dt);
      } else if (Number.isFinite(dt)) {
        label = new Date(dt * 1000).toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          ...(timezone ? { timeZone: timezone } : {}),
        });
      }

      return {
        index,
        dt: Number.isFinite(dt) ? dt : null,
        label,
        isStart: index === 0,
        isEnd: index === last,
      };
    })
    .filter((row) => row.label);
}


/**
 * Map an hourly (or current) point to Leaflet overlay opacities.
 * Tiles stay current-geometry; intensity tracks the forecast frame.
 * @param {object | null | undefined} point
 * @param {{ cloudBase?: number, precipBase?: number }} [opts]
 */
export function frameOverlayOpacities(point, {
  cloudBase = HERO_CLOUD_BASE_OPACITY,
  precipBase = HERO_PRECIP_BASE_OPACITY,
} = {}) {
  const clouds = Number(point?.clouds);
  const cloudFactor = Number.isFinite(clouds)
    ? Math.min(1, Math.max(0, clouds / 100))
    : 0.4;

  const pop = Number(point?.pop);
  const precipMm = Number(
    point?.precipitation
    ?? point?.rain1h
    ?? point?.snow1h
    ?? 0,
  );

  let precipFactor = Number.isFinite(pop) ? Math.min(1, Math.max(0, pop)) : 0;
  if (Number.isFinite(precipMm) && precipMm > 0) {
    precipFactor = Math.max(precipFactor, Math.min(1, precipMm / 4));
  }

  return {
    cloudOpacity: Number((cloudBase * (0.22 + 0.78 * cloudFactor)).toFixed(3)),
    precipOpacity: Number((precipBase * precipFactor).toFixed(3)),
    cloudFactor,
  };
}

/**
 * Smoothstep ease 0→1.
 * @param {number} t
 */
function smoothstep(t) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/**
 * Align sunrise/sunset to the same day window as dt.
 * @param {number} dt
 * @param {number} sunrise
 * @param {number} sunset
 * @returns {{ rise: number, set: number }}
 */
export function alignSolarWindow(dt, sunrise, sunset) {
  const period = 86400;
  let rise = sunrise;
  let set = sunset;
  while (dt > set + period / 2) {
    rise += period;
    set += period;
  }
  while (dt < rise - period / 2) {
    rise -= period;
    set -= period;
  }
  return { rise, set };
}

/**
 * Continuous night strength 0 (bright day) → 1 (deep night) from solar times.
 * @param {number} dt
 * @param {number} sunrise
 * @param {number} sunset
 * @param {number} [twilight]
 */
export function solarNightStrength(dt, sunrise, sunset, twilight = HERO_TWILIGHT_SECONDS) {
  const { rise, set } = alignSolarWindow(dt, sunrise, sunset);
  const dawnStart = rise - twilight;
  const dawnEnd = rise + twilight;
  const duskStart = set - twilight;
  const duskEnd = set + twilight;

  if (dt < dawnStart) {
    return 1;
  }
  if (dt < dawnEnd) {
    return 1 - smoothstep((dt - dawnStart) / (dawnEnd - dawnStart));
  }
  if (dt < duskStart) {
    return 0;
  }
  if (dt < duskEnd) {
    return smoothstep((dt - duskStart) / (duskEnd - duskStart));
  }
  return 1;
}

/**
 * Icon-only fallback when sunrise/sunset unavailable.
 * @param {object | null | undefined} point
 */
function iconNightStrength(point) {
  const icon = typeof point?.icon === 'string' ? point.icon : '';
  if (icon.endsWith('n')) {
    return 1;
  }
  if (icon.endsWith('d')) {
    const uvi = Number(point?.uvi);
    if (Number.isFinite(uvi) && uvi < 0.5) {
      return 0.42;
    }
    return 0.08;
  }
  return 0.35;
}

/**
 * Day/night wash strength 0 (bright day) → ~HERO_NIGHT_WASH_MAX (deep night).
 * Prefers continuous solar curve; falls back to icon flag.
 * @param {object | null | undefined} point
 * @param {{ sunrise?: number | null, sunset?: number | null } | null} [solar]
 */
export function dayNightWashStrength(point, solar = null) {
  const night = nightStrength(point, solar);
  return Number((night * HERO_NIGHT_WASH_MAX).toFixed(3));
}

/**
 * Raw night factor 0–1 (before wash/lights scaling).
 * @param {object | null | undefined} point
 * @param {{ sunrise?: number | null, sunset?: number | null } | null} [solar]
 */
export function nightStrength(point, solar = null) {
  const dt = Number(point?.dt);
  const sunrise = Number(solar?.sunrise);
  const sunset = Number(solar?.sunset);

  if (Number.isFinite(dt) && Number.isFinite(sunrise) && Number.isFinite(sunset)) {
    return solarNightStrength(dt, sunrise, sunset);
  }

  return iconNightStrength(point);
}

/**
 * Diurnal frame: darken (wash) + city lights (attenuated by clouds).
 * @param {object | null | undefined} point
 * @param {{ sunrise?: number | null, sunset?: number | null } | null} [solar]
 * @param {{ lightsMax?: number, washMax?: number, cloudAttenuation?: number }} [opts]
 */
export function frameDiurnalState(point, solar = null, {
  lightsMax = HERO_LIGHTS_MAX,
  washMax = HERO_NIGHT_WASH_MAX,
  cloudAttenuation = HERO_LIGHTS_CLOUD_ATTENUATION,
} = {}) {
  const night = nightStrength(point, solar);
  const clouds = Number(point?.clouds);
  const cloudFactor = Number.isFinite(clouds)
    ? Math.min(1, Math.max(0, clouds / 100))
    : 0.4;
  const lightsClear = night * lightsMax;
  const lights = lightsClear * (1 - cloudFactor * cloudAttenuation);

  return {
    night,
    wash: Number((night * washMax).toFixed(3)),
    lights: Number(Math.min(1, Math.max(0, lights)).toFixed(3)),
    cloudFactor,
  };
}

/**
 * Build a current-weather fallback frame when hourly is not ready yet.
 * @param {object | null | undefined} weather
 */
export function currentAsTimelinePoint(weather) {
  if (!weather) {
    return null;
  }

  return {
    dt: weather.updatedAt ?? Math.floor(Date.now() / 1000),
    clouds: weather.clouds,
    pop: 0,
    precipitation: weather.rain1h ?? weather.snow1h ?? weather.precipitation ?? 0,
    rain1h: weather.rain1h,
    snow1h: weather.snow1h,
    icon: weather.icon,
    uvi: weather.uvi,
  };
}

/**
 * Stable identity for a timeline window — ignore array reference churn.
 * @param {Array<{ dt?: number }> | null | undefined} hours
 */
export function heroTimelineIdentity(hours) {
  if (!hours?.length) {
    return '0:0';
  }
  return `${hours[0]?.dt ?? 0}:${hours.length}`;
}

/**
 * Clamp playhead into [0, length-1] (float-preserving for smooth scrub).
 * @param {number} index
 * @param {number} length
 */
export function clampHeroHourIndex(index, length) {
  if (!Number.isFinite(length) || length <= 0) {
    return 0;
  }
  if (!Number.isFinite(index)) {
    return 0;
  }
  return Math.min(length - 1, Math.max(0, index));
}

/**
 * Linear interpolate between two numbers.
 * @param {number} a
 * @param {number} b
 * @param {number} t
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Build a theater frame for a single timeline point.
 * @param {object | null | undefined} point
 * @param {{ sunrise?: number | null, sunset?: number | null } | null} [solar]
 */
export function theaterFrameForPoint(point, solar = null) {
  const opacities = frameOverlayOpacities(point, {
    cloudBase: HERO_CLOUD_BASE_OPACITY,
    precipBase: HERO_PRECIP_BASE_OPACITY,
  });
  const diurnal = frameDiurnalState(point, solar);

  return {
    cloudOpacity: opacities.cloudOpacity,
    precipOpacity: opacities.precipOpacity,
    wash: diurnal.wash,
    lights: diurnal.lights,
  };
}

/**
 * Interpolate overlay frame between adjacent hourly points.
 * @param {object | null | undefined} a
 * @param {object | null | undefined} b
 * @param {number} t 0–1
 * @param {{ sunrise?: number | null, sunset?: number | null } | null} [solar]
 */
export function lerpTheaterFrame(a, b, t, solar = null) {
  const ta = Math.min(1, Math.max(0, Number.isFinite(t) ? t : 0));
  if (!b || ta <= 0) {
    return theaterFrameForPoint(a, solar);
  }
  if (ta >= 1) {
    return theaterFrameForPoint(b, solar);
  }

  const fa = theaterFrameForPoint(a, solar);
  const fb = theaterFrameForPoint(b, solar);

  return {
    cloudOpacity: Number(lerp(fa.cloudOpacity, fb.cloudOpacity, ta).toFixed(3)),
    precipOpacity: Number(lerp(fa.precipOpacity, fb.precipOpacity, ta).toFixed(3)),
    wash: Number(lerp(fa.wash, fb.wash, ta).toFixed(3)),
    lights: Number(lerp(fa.lights, fb.lights, ta).toFixed(3)),
  };
}

/**
 * Resolve theater frame at a float hour index.
 * @param {Array<object>} hours
 * @param {number} hourIndex
 * @param {object | null | undefined} weather
 * @param {{ sunrise?: number | null, sunset?: number | null } | null} [solar]
 */
export function theaterFrameAtIndex(hours, hourIndex, weather, solar = null) {
  if (!hours?.length) {
    return theaterFrameForPoint(currentAsTimelinePoint(weather), solar);
  }

  const clamped = clampHeroHourIndex(hourIndex, hours.length);
  const lo = Math.floor(clamped);
  const hi = Math.min(hours.length - 1, lo + 1);
  const t = clamped - lo;
  const solarOpts = solar ?? {
    sunrise: weather?.sunrise ?? null,
    sunset: weather?.sunset ?? null,
  };

  if (lo === hi || t < 0.001) {
    return theaterFrameForPoint(hours[lo], solarOpts);
  }

  return lerpTheaterFrame(hours[lo], hours[hi], t, solarOpts);
}

/**
 * Interpolated unix timestamp at float hour index (for aria label).
 * @param {Array<{ dt?: number }>} hours
 * @param {number} hourIndex
 */
export function timelineDtAtIndex(hours, hourIndex) {
  if (!hours?.length) {
    return null;
  }
  const clamped = clampHeroHourIndex(hourIndex, hours.length);
  const lo = Math.floor(clamped);
  const hi = Math.min(hours.length - 1, lo + 1);
  const t = clamped - lo;
  const a = Number(hours[lo]?.dt);
  const b = Number(hours[hi]?.dt);
  if (!Number.isFinite(a)) {
    return null;
  }
  if (!Number.isFinite(b) || lo === hi) {
    return a;
  }
  return a + (b - a) * t;
}

/**
 * Float hour index for an absolute unix timestamp within the timeline window.
 * @param {Array<{ dt?: number }>} hours
 * @param {number} dt
 * @returns {number | null}
 */
export function timelineIndexAtDt(hours, dt) {
  if (!hours?.length || !Number.isFinite(dt)) {
    return null;
  }

  const first = Number(hours[0]?.dt);
  const last = Number(hours[hours.length - 1]?.dt);
  if (!Number.isFinite(first) || !Number.isFinite(last)) {
    return null;
  }
  if (dt < first || dt > last) {
    return null;
  }

  for (let i = 0; i < hours.length - 1; i += 1) {
    const a = Number(hours[i]?.dt);
    const b = Number(hours[i + 1]?.dt);
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      continue;
    }
    if (dt >= a && dt <= b) {
      if (b === a) {
        return i;
      }
      return i + (dt - a) / (b - a);
    }
  }

  return hours.length - 1;
}

/**
 * Sunrise/sunset markers clipped to the 24h hero window.
 * @param {Array<{ dt?: number }>} hours
 * @param {{ sunrise?: number | null, sunset?: number | null } | null} solar
 * @param {{ formatHour?: (dt: number) => string }} [opts]
 * @returns {Array<{ kind: 'sunrise' | 'sunset', dt: number, index: number, label: string }>}
 */
export function buildHeroSolarMarkers(hours, solar, { formatHour = null } = {}) {
  if (!hours?.length) {
    return [];
  }

  const sunrise = Number(solar?.sunrise);
  const sunset = Number(solar?.sunset);
  const first = Number(hours[0]?.dt);
  if (!Number.isFinite(sunrise) || !Number.isFinite(sunset) || !Number.isFinite(first)) {
    return [];
  }

  const { rise, set } = alignSolarWindow(first, sunrise, sunset);
  const candidates = [
    { kind: 'sunrise', dt: rise },
    { kind: 'sunset', dt: set },
    { kind: 'sunrise', dt: rise + 86400 },
    { kind: 'sunset', dt: set + 86400 },
  ];

  /** @type {Array<{ kind: 'sunrise' | 'sunset', dt: number, index: number, label: string }>} */
  const markers = [];
  const seen = new Set();

  for (const candidate of candidates) {
    const index = timelineIndexAtDt(hours, candidate.dt);
    if (index == null) {
      continue;
    }
    const key = `${candidate.kind}:${Math.round(index * 100)}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    markers.push({
      kind: candidate.kind,
      dt: candidate.dt,
      index,
      label: typeof formatHour === 'function' ? formatHour(candidate.dt) : '',
    });
  }

  return markers.sort((a, b) => a.index - b.index);
}

/**
 * Static frame when theater is disabled (photo hero).
 */
export function disabledTheaterFrame() {
  return {
    cloudOpacity: HERO_CLOUD_BASE_OPACITY,
    precipOpacity: HERO_PRECIP_BASE_OPACITY,
    wash: 0.2,
    lights: 0,
  };
}
