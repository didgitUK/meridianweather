import { getApiKey, fetchOpenWeather, ApiError } from '@/lib/api-client';
import {
  ADMIN_CONNECTION_CHECK_MODE,
  ADMIN_CONNECTION_KIND,
  ADMIN_CONNECTION_STATUS,
  ADMIN_CONNECTIONS,
} from '@/constants/admin-connections';
import { getAdSenseAdminConfig } from '@/lib/server/adsense';
import {
  getAdSenseReportingAdminConfig,
  probeAdSenseConnection,
} from '@/lib/server/adsense-management';
import { getEmailProviderConnectionSnapshots } from '@/lib/server/email-connectors';
import { getPlatformSettings } from '@/lib/platform-settings';

/** Lightweight canary coords (London) — avoids geocode lookup cost. */
const WEATHER_CANARY = { lat: 51.5074, lon: -0.1278 };
const WEATHER_CHECK_CACHE_MS = 60_000;
const ADSENSE_CHECK_CACHE_MS = 60_000;

let weatherCheckCache = null;
let adsenseCheckCache = null;

function baseConnection(definition, overrides = {}) {
  return {
    id: definition.id,
    label: definition.label,
    description: definition.description,
    kind: definition.kind ?? ADMIN_CONNECTION_KIND.ITEM,
    checkMode: definition.checkMode,
    status: ADMIN_CONNECTION_STATUS.PENDING,
    message: '',
    checkedAt: null,
    ...overrides,
  };
}

async function checkWeatherConnection({ force = false } = {}) {
  const definition = ADMIN_CONNECTIONS.find((item) => item.id === 'weather');
  const now = Date.now();

  if (
    !force &&
    weatherCheckCache &&
    now - weatherCheckCache.checkedAt < WEATHER_CHECK_CACHE_MS
  ) {
    return weatherCheckCache;
  }

  const settings = getPlatformSettings();
  const databaseKey = settings.openWeatherApiKey?.trim() ?? '';
  const envKey = process.env.OPENWEATHER_API_KEY?.trim() ?? '';

  let key;
  try {
    key = getApiKey();
  } catch {
    const result = baseConnection(definition, {
      status: ADMIN_CONNECTION_STATUS.NOT_CONFIGURED,
      message: 'OpenWeather API key is not configured.',
      checkedAt: now,
    });
    weatherCheckCache = result;
    return result;
  }

  try {
    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?lat=${WEATHER_CANARY.lat}&lon=${WEATHER_CANARY.lon}&appid=${key}&units=metric`;

    await fetchOpenWeather(url, { endpoint: 'admin_connection_check' });

    const result = baseConnection(definition, {
      status: ADMIN_CONNECTION_STATUS.CONNECTED,
      message: 'OpenWeather responded successfully.',
      checkedAt: now,
      source: databaseKey ? 'database' : envKey ? 'environment' : null,
    });
    weatherCheckCache = result;
    return result;
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : 'Unable to reach OpenWeather.';

    const result = baseConnection(definition, {
      status: ADMIN_CONNECTION_STATUS.ERROR,
      message,
      checkedAt: now,
    });
    weatherCheckCache = result;
    return result;
  }
}

async function checkAdSenseConnection({ force = false } = {}) {
  const definition = ADMIN_CONNECTIONS.find((item) => item.id === 'adsense');
  const ads = getAdSenseAdminConfig();
  const reporting = getAdSenseReportingAdminConfig();
  const now = Date.now();

  if (
    !force &&
    adsenseCheckCache &&
    now - adsenseCheckCache.checkedAt < ADSENSE_CHECK_CACHE_MS
  ) {
    return adsenseCheckCache;
  }

  if (!ads.adsenseEnabled) {
    const result = baseConnection(definition, {
      status: ADMIN_CONNECTION_STATUS.DISABLED,
      message: 'AdSense is disabled in platform settings.',
      checkedAt: now,
    });
    adsenseCheckCache = result;
    return result;
  }

  if (reporting.connected) {
    try {
      const { accounts } = await probeAdSenseConnection();
      const result = baseConnection(definition, {
        status: ADMIN_CONNECTION_STATUS.CONNECTED,
        message: accounts[0]?.displayName
          ? `Management API connected · ${accounts[0].displayName}`
          : 'Management API connected.',
        checkedAt: now,
      });
      adsenseCheckCache = result;
      return result;
    } catch (error) {
      const result = baseConnection(definition, {
        status: ADMIN_CONNECTION_STATUS.ERROR,
        message: error.message || 'AdSense Management API probe failed.',
        checkedAt: now,
      });
      adsenseCheckCache = result;
      return result;
    }
  }

  if (!ads.effectiveClientId) {
    const result = baseConnection(definition, {
      status: ADMIN_CONNECTION_STATUS.NOT_CONFIGURED,
      message: 'No AdSense publisher ID or Management API connection.',
      checkedAt: now,
    });
    adsenseCheckCache = result;
    return result;
  }

  const result = baseConnection(definition, {
    status: ADMIN_CONNECTION_STATUS.CONFIGURED,
    message: 'Publisher ID present. Connect Google for earnings reports.',
    checkedAt: now,
  });
  adsenseCheckCache = result;
  return result;
}

function buildEmailConnectionGroup() {
  const definition = ADMIN_CONNECTIONS.find((item) => item.id === 'email');
  const now = Date.now();
  const snapshots = getEmailProviderConnectionSnapshots();

  const children = snapshots.map((snapshot) => {
    if (snapshot.active && snapshot.configured) {
      return {
        id: snapshot.id,
        providerId: snapshot.providerId,
        label: snapshot.label,
        active: true,
        status: ADMIN_CONNECTION_STATUS.ACTIVE,
        message: `${snapshot.label} is the active sender.`,
        checkedAt: now,
        source: snapshot.source,
      };
    }

    if (snapshot.active && !snapshot.configured) {
      return {
        id: snapshot.id,
        providerId: snapshot.providerId,
        label: snapshot.label,
        active: true,
        status: ADMIN_CONNECTION_STATUS.NOT_CONFIGURED,
        message: `${snapshot.label} is active but credentials are missing.`,
        checkedAt: now,
        source: snapshot.source,
      };
    }

    if (!snapshot.active && snapshot.configured) {
      return {
        id: snapshot.id,
        providerId: snapshot.providerId,
        label: snapshot.label,
        active: false,
        status: ADMIN_CONNECTION_STATUS.INACTIVE,
        message: `${snapshot.label} is configured but not active.`,
        checkedAt: now,
        source: snapshot.source,
      };
    }

    return {
      id: snapshot.id,
      providerId: snapshot.providerId,
      label: snapshot.label,
      active: false,
      status: ADMIN_CONNECTION_STATUS.NOT_CONFIGURED,
      message: `${snapshot.label} is not configured.`,
      checkedAt: now,
      source: snapshot.source,
    };
  });

  return baseConnection(definition, {
    kind: ADMIN_CONNECTION_KIND.GROUP,
    status: ADMIN_CONNECTION_STATUS.CONFIGURED,
    message: 'Email connector modules',
    checkedAt: now,
    children,
  });
}

export async function getAdminConnectionStatuses({ force = false } = {}) {
  const [weather, adsense] = await Promise.all([
    checkWeatherConnection({ force }),
    checkAdSenseConnection({ force }),
  ]);

  return {
    connections: [weather, adsense, buildEmailConnectionGroup()],
    meta: {
      checkModes: {
        weather: ADMIN_CONNECTION_CHECK_MODE.LIVE,
        adsense: ADMIN_CONNECTION_CHECK_MODE.LIVE,
        email: ADMIN_CONNECTION_CHECK_MODE.CONFIG,
      },
    },
  };
}
