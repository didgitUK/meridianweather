import { NextResponse } from 'next/server';
import { getRecentAdminAuditEvents } from '@/lib/admin-audit-repo';
import { maskSecret } from '@/lib/mask-secret';
import { getUsageSnapshot } from '@/lib/api-usage-tracker';
import { getPlatformSettings, updatePlatformSettings } from '@/lib/platform-settings';
import { getAdSenseAdminConfig } from '@/lib/server/adsense';
import { getAdSenseReportingAdminConfig } from '@/lib/server/adsense-management';
import { EMAIL_PROVIDERS, getEmailConnectorsAdminConfig } from '@/lib/server/email-connectors';
import { getAlertConnectorsAdminConfig } from '@/lib/server/alert-connectors';
import { isAdminRequestAuthorized } from '@/lib/server/admin-auth';
import { listLocations, listInaccurateReports, applyInaccuracyAutoDismiss } from '@/lib/location-repo';
import { REFRESH_OPTIONS } from '@/constants/weather';

const REFRESH_VALUES = new Set(REFRESH_OPTIONS.map((option) => option.value));
const EMAIL_PROVIDER_VALUES = new Set(Object.values(EMAIL_PROVIDERS));
const MASKED_PLACEHOLDER = '••••••••';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

function isBlankOrMasked(value) {
  return value == null || value === '' || value === MASKED_PLACEHOLDER;
}

function sanitizeSettings(settings) {
  const databaseKey = settings.openWeatherApiKey?.trim() ?? '';
  const envKey = process.env.OPENWEATHER_API_KEY?.trim() ?? '';
  const effectiveKey = databaseKey || envKey;

  return {
    ...settings,
    openWeatherApiKeyConfigured: Boolean(effectiveKey),
    openWeatherApiKeySource: databaseKey ? 'database' : envKey ? 'environment' : null,
    openWeatherApiKeyMasked: maskSecret(effectiveKey),
    openWeatherApiKey: '',
    openWeatherApiKeyViews: getRecentAdminAuditEvents('openweather_api_key_viewed', 5),
    resendApiKey: '',
    sendgridApiKey: '',
    sesAccessKeyId: '',
    sesSecretAccessKey: '',
    adsenseOauthRefreshToken: '',
  };
}

export async function GET(request) {
  if (!isAdminRequestAuthorized(request)) {
    return unauthorized();
  }

  applyInaccuracyAutoDismiss();

  return NextResponse.json({
    settings: sanitizeSettings(getPlatformSettings()),
    usage: getUsageSnapshot(),
    ads: {
      ...getAdSenseAdminConfig(),
      reporting: getAdSenseReportingAdminConfig(),
    },
    emailConnectors: getEmailConnectorsAdminConfig(),
    alertConnectors: getAlertConnectorsAdminConfig(),
    locations: listLocations({ limit: 100 }),
    inaccurateReports: listInaccurateReports({ limit: 200 }),
    refreshOptions: REFRESH_OPTIONS,
  });
}

export async function PATCH(request) {
  if (!isAdminRequestAuthorized(request)) {
    return unauthorized();
  }

  const body = await request.json();
  const current = getPlatformSettings();
  const next = { ...current };

  if (body.refreshIntervalMs != null) {
    if (!REFRESH_VALUES.has(body.refreshIntervalMs)) {
      return NextResponse.json({ error: 'invalid_request', message: 'Unsupported refresh interval' }, { status: 400 });
    }
    next.refreshIntervalMs = body.refreshIntervalMs;
  }

  if (body.staleCacheMaxMs != null) {
    next.staleCacheMaxMs = Number(body.staleCacheMaxMs);
  }

  if (body.dailyLimit != null) {
    next.dailyLimit = Number(body.dailyLimit);
  }

  if (body.softBlockThreshold != null) {
    next.softBlockThreshold = Number(body.softBlockThreshold);
  }

  if (body.warningThreshold != null) {
    next.warningThreshold = Number(body.warningThreshold);
  }

  if (body.perMinuteLimit != null) {
    next.perMinuteLimit = Number(body.perMinuteLimit);
  }

  if (body.maxSavedCities != null) {
    next.maxSavedCities = Number(body.maxSavedCities);
  }

  if (body.adsenseClientId != null) {
    next.adsenseClientId = String(body.adsenseClientId).trim();
  }

  if (body.adsenseSlotDashboard != null) {
    next.adsenseSlotDashboard = String(body.adsenseSlotDashboard).trim();
  }

  if (body.adsenseEnabled != null) {
    next.adsenseEnabled = Boolean(body.adsenseEnabled);
  }

  if (body.openWeatherApiKey != null && !isBlankOrMasked(body.openWeatherApiKey)) {
    next.openWeatherApiKey = String(body.openWeatherApiKey).trim();
  }

  if (body.inaccuracyAutoDismissEnabled != null) {
    next.inaccuracyAutoDismissEnabled = Boolean(body.inaccuracyAutoDismissEnabled);
  }

  if (body.inaccuracyAutoDismissDays != null) {
    next.inaccuracyAutoDismissDays = Number(body.inaccuracyAutoDismissDays);
  }

  if (body.emailProvider != null) {
    const provider = String(body.emailProvider).trim();
    if (!EMAIL_PROVIDER_VALUES.has(provider)) {
      return NextResponse.json(
        { error: 'invalid_request', message: 'Unsupported email provider' },
        { status: 400 },
      );
    }
    next.emailProvider = provider;
  }

  if (body.resendApiKey != null && !isBlankOrMasked(body.resendApiKey)) {
    next.resendApiKey = String(body.resendApiKey).trim();
  }

  if (body.resendFromEmail != null) {
    next.resendFromEmail = String(body.resendFromEmail).trim();
  }

  if (body.resendAudienceId != null) {
    next.resendAudienceId = String(body.resendAudienceId).trim();
  }

  if (body.sendgridApiKey != null && !isBlankOrMasked(body.sendgridApiKey)) {
    next.sendgridApiKey = String(body.sendgridApiKey).trim();
  }

  if (body.sendgridFromEmail != null) {
    next.sendgridFromEmail = String(body.sendgridFromEmail).trim();
  }

  if (body.sendgridListId != null) {
    next.sendgridListId = String(body.sendgridListId).trim();
  }

  if (body.sesAccessKeyId != null && !isBlankOrMasked(body.sesAccessKeyId)) {
    next.sesAccessKeyId = String(body.sesAccessKeyId).trim();
  }

  if (body.sesSecretAccessKey != null && !isBlankOrMasked(body.sesSecretAccessKey)) {
    next.sesSecretAccessKey = String(body.sesSecretAccessKey).trim();
  }

  if (body.sesRegion != null) {
    next.sesRegion = String(body.sesRegion).trim() || 'eu-west-1';
  }

  if (body.sesFromEmail != null) {
    next.sesFromEmail = String(body.sesFromEmail).trim();
  }

  if (body.emailLastSyncedAt != null) {
    next.emailLastSyncedAt = body.emailLastSyncedAt ? String(body.emailLastSyncedAt) : null;
  }

  if (body.openMeteoAlertsEnabled != null) {
    next.openMeteoAlertsEnabled = Boolean(body.openMeteoAlertsEnabled);
  }

  if (body.nwsAlertsEnabled != null) {
    next.nwsAlertsEnabled = Boolean(body.nwsAlertsEnabled);
  }

  if (body.windAlertThresholdMs != null) {
    next.windAlertThresholdMs = Number(body.windAlertThresholdMs);
  }

  const numericFields = [
    'staleCacheMaxMs',
    'dailyLimit',
    'softBlockThreshold',
    'warningThreshold',
    'perMinuteLimit',
    'maxSavedCities',
    'inaccuracyAutoDismissDays',
    'windAlertThresholdMs',
  ];

  for (const field of numericFields) {
    const value = next[field];
    if (!Number.isFinite(value) || value < 1) {
      return NextResponse.json(
        { error: 'invalid_request', message: `${field} must be a positive number` },
        { status: 400 },
      );
    }
  }

  const settings = updatePlatformSettings(next);
  applyInaccuracyAutoDismiss();

  return NextResponse.json({
    settings: sanitizeSettings(settings),
    usage: getUsageSnapshot(),
    ads: {
      ...getAdSenseAdminConfig(),
      reporting: getAdSenseReportingAdminConfig(),
    },
    emailConnectors: getEmailConnectorsAdminConfig(),
    alertConnectors: getAlertConnectorsAdminConfig(),
    locations: listLocations({ limit: 100 }),
    inaccurateReports: listInaccurateReports({ limit: 200 }),
  });
}
