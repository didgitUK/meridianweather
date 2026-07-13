/**
 * Subscriber-selectable weather alert types, grouped for admin UI.
 * `source` indicates which feed typically evaluates the type:
 * - openweather: derived from current conditions / icons
 * - open-meteo: official national warnings via Open-Meteo
 * - nws: US National Weather Service active alerts
 */

export const ALERT_SOURCES = {
  openweather: 'openweather',
  openMeteo: 'open-meteo',
  nws: 'nws',
};

/** @typedef {{ id: string, label: string, shortLabel?: string, defaultOn?: boolean, source: string, matchHints?: string[] }} AlertTypeDef */

/** @type {Array<{ id: string, label: string, types: AlertTypeDef[] }>} */
export const ALERT_TYPE_GROUPS = [
  {
    id: 'standard',
    label: 'Standard alerts',
    types: [
      { id: 'rain', label: 'Rain', defaultOn: true, source: ALERT_SOURCES.openweather },
      { id: 'wind', label: 'Wind', defaultOn: false, source: ALERT_SOURCES.openweather },
      {
        id: 'thunderstorm',
        label: 'Thunderstorms',
        shortLabel: 'Storm',
        defaultOn: true,
        source: ALERT_SOURCES.openweather,
        matchHints: ['thunderstorm', 'thunder'],
      },
      { id: 'snow', label: 'Snow', defaultOn: false, source: ALERT_SOURCES.openweather },
      {
        id: 'ice',
        label: 'Ice',
        defaultOn: false,
        source: ALERT_SOURCES.openMeteo,
        matchHints: ['ice', 'freezing', 'glaze', 'black ice'],
      },
      {
        id: 'extreme_heat',
        label: 'Extreme heat',
        shortLabel: 'Heat',
        defaultOn: false,
        source: ALERT_SOURCES.openMeteo,
        matchHints: ['heat', 'hot', 'temperature'],
      },
      { id: 'fog', label: 'Fog', defaultOn: false, source: ALERT_SOURCES.openweather },
      {
        id: 'lightning',
        label: 'Lightning',
        defaultOn: false,
        source: ALERT_SOURCES.openMeteo,
        matchHints: ['lightning', 'thunderstorm'],
      },
    ],
  },
  {
    id: 'severity',
    label: 'Severity levels',
    types: [
      {
        id: 'yellow_warning',
        label: 'Yellow warning',
        shortLabel: 'Yellow',
        defaultOn: false,
        source: ALERT_SOURCES.openMeteo,
        matchHints: ['yellow', 'moderate', 'minor'],
      },
      {
        id: 'amber_warning',
        label: 'Amber warning',
        shortLabel: 'Amber',
        defaultOn: false,
        source: ALERT_SOURCES.openMeteo,
        matchHints: ['amber', 'orange', 'severe'],
      },
      {
        id: 'red_warning',
        label: 'Red warning',
        shortLabel: 'Red',
        defaultOn: true,
        source: ALERT_SOURCES.openMeteo,
        matchHints: ['red', 'extreme', 'emergency'],
      },
    ],
  },
  {
    id: 'hydrological',
    label: 'Hydrological',
    types: [
      {
        id: 'flood_alert',
        label: 'Flood alert',
        shortLabel: 'Flood alert',
        defaultOn: false,
        source: ALERT_SOURCES.openMeteo,
        matchHints: ['flood alert', 'flood watch'],
      },
      {
        id: 'flood_warning',
        label: 'Flood warning',
        shortLabel: 'Flood warn',
        defaultOn: true,
        source: ALERT_SOURCES.openMeteo,
        matchHints: ['flood warning', 'flood'],
      },
      {
        id: 'severe_flood_warning',
        label: 'Severe flood warning',
        shortLabel: 'Sev. flood',
        defaultOn: true,
        source: ALERT_SOURCES.openMeteo,
        matchHints: ['severe flood', 'flash flood'],
      },
    ],
  },
  {
    id: 'environment',
    label: 'Environment',
    types: [
      {
        id: 'air_quality',
        label: 'Air quality',
        shortLabel: 'AQI',
        defaultOn: false,
        source: ALERT_SOURCES.openMeteo,
        matchHints: ['air quality', 'smoke', 'pollution', 'aqi'],
      },
      {
        id: 'marine',
        label: 'High surf / marine',
        shortLabel: 'Marine',
        defaultOn: false,
        source: ALERT_SOURCES.openMeteo,
        matchHints: ['surf', 'marine', 'coastal', 'high seas', 'gale'],
      },
      {
        id: 'uv',
        label: 'UV / sun',
        shortLabel: 'UV',
        defaultOn: false,
        source: ALERT_SOURCES.openMeteo,
        matchHints: ['uv', 'ultraviolet', 'sun'],
      },
    ],
  },
  {
    id: 'us_severe',
    label: 'US severe weather',
    types: [
      {
        id: 'tornado_watch',
        label: 'Tornado watch',
        shortLabel: 'TOR watch',
        defaultOn: true,
        source: ALERT_SOURCES.nws,
        matchHints: ['tornado watch'],
      },
      {
        id: 'tornado_warning',
        label: 'Tornado warning',
        shortLabel: 'TOR warn',
        defaultOn: true,
        source: ALERT_SOURCES.nws,
        matchHints: ['tornado warning'],
      },
      {
        id: 'tornado_emergency',
        label: 'Tornado emergency',
        shortLabel: 'TOR emerg',
        defaultOn: true,
        source: ALERT_SOURCES.nws,
        matchHints: ['tornado emergency'],
      },
      {
        id: 'severe_thunderstorm',
        label: 'Severe thunderstorm',
        shortLabel: 'Sev. T-storm',
        defaultOn: true,
        source: ALERT_SOURCES.nws,
        matchHints: ['severe thunderstorm'],
      },
      {
        id: 'hurricane',
        label: 'Hurricane / tropical',
        shortLabel: 'Hurricane',
        defaultOn: true,
        source: ALERT_SOURCES.nws,
        matchHints: ['hurricane', 'tropical storm', 'tropical cyclone'],
      },
    ],
  },
];

export const ALL_ALERT_TYPES = ALERT_TYPE_GROUPS.flatMap((group) => group.types);

export const ALERT_TYPE_BY_ID = Object.fromEntries(
  ALL_ALERT_TYPES.map((type) => [type.id, type]),
);

export function createDefaultAlertPrefs({ rain = true, storm = true } = {}) {
  const prefs = {};
  for (const type of ALL_ALERT_TYPES) {
    prefs[type.id] = Boolean(type.defaultOn);
  }
  // Preserve legacy rain/storm signup semantics when creating from the public dialog.
  prefs.rain = Boolean(rain);
  prefs.thunderstorm = Boolean(storm);
  return prefs;
}

/** Enable every subscriber-selectable alert type. */
export function createAllAlertPrefs() {
  const prefs = {};
  for (const type of ALL_ALERT_TYPES) {
    prefs[type.id] = true;
  }
  return prefs;
}

export function areAllAlertPrefsEnabled(prefs) {
  return ALL_ALERT_TYPES.every((type) => Boolean(prefs?.[type.id]));
}

/**
 * Normalize prefs from DB JSON + legacy rain/storm columns.
 * @param {unknown} rawJson
 * @param {{ alertOnRain?: boolean, alertOnStorm?: boolean }} [legacy]
 */
export function normalizeAlertPrefs(rawJson, legacy = {}) {
  let parsed = {};
  if (typeof rawJson === 'string' && rawJson.trim()) {
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      parsed = {};
    }
  } else if (rawJson && typeof rawJson === 'object') {
    parsed = rawJson;
  }

  const prefs = createDefaultAlertPrefs({ rain: false, storm: false });
  for (const type of ALL_ALERT_TYPES) {
    if (typeof parsed[type.id] === 'boolean') {
      prefs[type.id] = parsed[type.id];
    } else {
      prefs[type.id] = false;
    }
  }

  // Legacy columns win when JSON is empty / first migration.
  const jsonEmpty = !rawJson || rawJson === '{}' || Object.keys(parsed).length === 0;
  if (jsonEmpty) {
    prefs.rain = Boolean(legacy.alertOnRain);
    prefs.thunderstorm = Boolean(legacy.alertOnStorm);
  } else if (typeof parsed.storm === 'boolean' && typeof parsed.thunderstorm !== 'boolean') {
    prefs.thunderstorm = parsed.storm;
  }

  return prefs;
}

export function hasAnyAlertPrefEnabled(prefs) {
  return ALL_ALERT_TYPES.some((type) => Boolean(prefs?.[type.id]));
}

export function countEnabledAlertPrefs(prefs) {
  return ALL_ALERT_TYPES.filter((type) => Boolean(prefs?.[type.id])).length;
}
