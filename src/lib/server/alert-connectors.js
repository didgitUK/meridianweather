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
        'Global national weather warnings standardized into one JSON feed. Free, no API key.',
      docsUrl: 'https://open-meteo.com/en/docs/warnings-api',
      endpoint: 'https://api.open-meteo.com/v1/warnings',
      enabled: Boolean(settings.openMeteoAlertsEnabled ?? true),
      configured: true,
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
