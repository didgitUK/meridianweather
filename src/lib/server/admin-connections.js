import { getApiKey, fetchOpenWeather, ApiError } from '@/lib/api-client';
import {
  ADMIN_ALERT_FEED_CONNECTIONS,
  ADMIN_CONNECTION_CHECK_MODE,
  ADMIN_CONNECTION_KIND,
  ADMIN_CONNECTION_STATUS,
  ADMIN_CONNECTIONS,
} from '@/constants/admin-connections';
import { WEATHER_CHECK_TRIGGERS } from '@/constants/weather-check-triggers';
import { getAdSenseAdminConfig } from '@/lib/server/adsense';
import {
  getAdSenseReportingAdminConfig,
  probeAdSenseConnection,
} from '@/lib/server/adsense-management';
import { getEmailProviderConnectionSnapshots } from '@/lib/server/email-connectors';
import { trackUpstreamCall } from '@/lib/api-usage-tracker';
import { getPlatformSettings } from '@/lib/platform-settings';

/** Lightweight canary coords (London) — avoids geocode lookup cost. */
const WEATHER_CANARY = { lat: 51.5074, lon: -0.1278 };
/** US point for NWS canary (NYC) — NWS coverage is US-centric. */
const NWS_CANARY = { lat: 40.7128, lon: -74.006 };
const WEATHER_CHECK_CACHE_MS = 60_000;
const ADSENSE_CHECK_CACHE_MS = 60_000;
const ALERT_FEED_CHECK_CACHE_MS = 60_000;

let weatherCheckCache = null;
let adsenseCheckCache = null;
let alertFeedCheckCache = null;

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

    const tracked = await trackUpstreamCall(
      'admin_connection_check',
      () => fetchOpenWeather(url, { endpoint: 'admin_connection_check' }),
      {
        trigger: WEATHER_CHECK_TRIGGERS.adminConnectionCheck,
        reason: 'admin_api_connections_probe',
        lat: WEATHER_CANARY.lat,
        lon: WEATHER_CANARY.lon,
      },
    );

    if (tracked.blocked) {
      const result = baseConnection(definition, {
        status: ADMIN_CONNECTION_STATUS.ERROR,
        message: 'Weather updates are paused until quota resets.',
        checkedAt: now,
      });
      weatherCheckCache = result;
      return result;
    }

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

async function probeOpenMeteoWarnings() {
  const url =
    `https://api.open-meteo.com/v1/warnings` +
    `?latitude=${WEATHER_CANARY.lat}&longitude=${WEATHER_CANARY.lon}`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (response.status === 404 || response.status === 410) {
    const error = new Error(
      `Open-Meteo Warnings API is unavailable (HTTP ${response.status}). Feed cannot be probed until upstream restores it.`,
    );
    error.code = 'upstream_unavailable';
    error.status = response.status;
    throw error;
  }

  if (!response.ok) {
    throw new Error(`Open-Meteo warnings failed (${response.status})`);
  }

  return response.json();
}

async function probeNwsAlerts() {
  const url =
    `https://api.weather.gov/alerts/active?point=${NWS_CANARY.lat},${NWS_CANARY.lon}`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/geo+json',
      'User-Agent': 'meridian-weather (https://meridianweather.co.uk)',
    },
    cache: 'no-store',
  });

  // NWS may return 404 outside coverage for some points; 200/404 both mean the API is reachable.
  if (!response.ok && response.status !== 404 && response.status !== 400) {
    throw new Error(`NWS alerts failed (${response.status})`);
  }

  return response;
}

async function checkAlertFeedConnections({ force = false } = {}) {
  const definition = ADMIN_CONNECTIONS.find((item) => item.id === 'alert-feeds');
  const now = Date.now();

  if (
    !force &&
    alertFeedCheckCache &&
    now - alertFeedCheckCache.checkedAt < ALERT_FEED_CHECK_CACHE_MS
  ) {
    return alertFeedCheckCache;
  }

  const settings = getPlatformSettings();
  const feedMeta = Object.fromEntries(
    ADMIN_ALERT_FEED_CONNECTIONS.map((feed) => [feed.id, feed]),
  );

  const openMeteoEnabled = Boolean(settings.openMeteoAlertsEnabled ?? true);
  const nwsEnabled = Boolean(settings.nwsAlertsEnabled ?? true);

  const [openMeteoResult, nwsResult] = await Promise.all([
    (async () => {
      const feed = feedMeta['open-meteo'];
      if (!openMeteoEnabled) {
        return {
          id: feed.id,
          label: feed.label,
          status: ADMIN_CONNECTION_STATUS.DISABLED,
          message: 'Open-Meteo warnings are disabled in Alert feeds.',
          checkedAt: now,
        };
      }

      try {
        await probeOpenMeteoWarnings();
        return {
          id: feed.id,
          label: feed.label,
          status: ADMIN_CONNECTION_STATUS.CONNECTED,
          message: 'Open-Meteo warnings API responded successfully.',
          checkedAt: now,
        };
      } catch (error) {
        const unavailable = error?.code === 'upstream_unavailable'
          || error?.status === 404
          || error?.status === 410
          || /HTTP 404|HTTP 410|unavailable \(HTTP/.test(String(error?.message ?? ''));
        return {
          id: feed.id,
          label: feed.label,
          status: unavailable ? ADMIN_CONNECTION_STATUS.PENDING : ADMIN_CONNECTION_STATUS.ERROR,
          message: error.message || 'Unable to reach Open-Meteo warnings.',
          checkedAt: now,
        };
      }
    })(),
    (async () => {
      const feed = feedMeta.nws;
      if (!nwsEnabled) {
        return {
          id: feed.id,
          label: feed.label,
          status: ADMIN_CONNECTION_STATUS.DISABLED,
          message: 'US NWS alerts are disabled in Alert feeds.',
          checkedAt: now,
        };
      }

      try {
        await probeNwsAlerts();
        return {
          id: feed.id,
          label: feed.label,
          status: ADMIN_CONNECTION_STATUS.CONNECTED,
          message: 'US NWS alerts API responded successfully.',
          checkedAt: now,
        };
      } catch (error) {
        return {
          id: feed.id,
          label: feed.label,
          status: ADMIN_CONNECTION_STATUS.ERROR,
          message: error.message || 'Unable to reach US NWS alerts.',
          checkedAt: now,
        };
      }
    })(),
  ]);

  const result = baseConnection(definition, {
    kind: ADMIN_CONNECTION_KIND.GROUP,
    status: ADMIN_CONNECTION_STATUS.CONFIGURED,
    message: 'Alert data feeds',
    checkedAt: now,
    children: [openMeteoResult, nwsResult],
  });
  alertFeedCheckCache = result;
  return result;
}

export async function getAdminConnectionStatuses({ force = false } = {}) {
  const [weather, adsense, alertFeeds] = await Promise.all([
    checkWeatherConnection({ force }),
    checkAdSenseConnection({ force }),
    checkAlertFeedConnections({ force }),
  ]);

  return {
    connections: [weather, adsense, buildEmailConnectionGroup(), alertFeeds],
    meta: {
      checkModes: {
        weather: ADMIN_CONNECTION_CHECK_MODE.LIVE,
        adsense: ADMIN_CONNECTION_CHECK_MODE.LIVE,
        email: ADMIN_CONNECTION_CHECK_MODE.CONFIG,
        'alert-feeds': ADMIN_CONNECTION_CHECK_MODE.LIVE,
      },
    },
  };
}
