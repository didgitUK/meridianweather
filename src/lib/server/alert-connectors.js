import { getPlatformSettings } from '@/lib/platform-settings';

/**
 * Sanitized alert-feed connector status for admin UI.
 */
export function getAlertConnectorsAdminConfig() {
  const settings = getPlatformSettings();

  return {
    openMeteo: {
      id: 'open-meteo',
      label: 'Open-Meteo warnings',
      description:
        'National weather warnings via Open-Meteo. Upstream /v1/warnings is currently unavailable (HTTP 404) — toggle off until restored; cron returns no Open-Meteo events meanwhile.',
      docsUrl: 'https://open-meteo.com/en/docs',
      endpoint: 'https://api.open-meteo.com/v1/warnings',
      enabled: Boolean(settings.openMeteoAlertsEnabled ?? true),
      configured: true,
      upstreamAvailable: false,
      source: 'public',
    },
    nws: {
      id: 'nws',
      label: 'US National Weather Service',
      description:
        'Official US watches, warnings, and emergencies (including tornado). Free, no API key.',
      docsUrl: 'https://www.weather.gov/documentation/services-web-api',
      endpoint: 'https://api.weather.gov/alerts/active',
      enabled: Boolean(settings.nwsAlertsEnabled ?? true),
      configured: true,
      source: 'public',
    },
    windThresholdMs: Number(settings.windAlertThresholdMs ?? 15),
  };
}
