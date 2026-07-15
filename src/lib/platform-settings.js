import { getDb } from '@/lib/db';
import { DEFAULT_SES_REGION, DEFAULT_SMTP_PORT } from '@/constants/email-providers';
import { decryptSecret, encryptSecret } from '@/lib/server/secret-crypto';

const SECRET_FIELDS = [
  'openWeatherApiKey',
  'resendApiKey',
  'sendgridApiKey',
  'sesSecretAccessKey',
  'smtpPassword',
  'adsenseOauthRefreshToken',
];

function storeSecret(value) {
  if (value == null || value === '') {
    return '';
  }

  if (typeof value !== 'string') {
    return '';
  }

  // Already encrypted (e.g. AdSense OAuth callback) or explicit plain fallback.
  if (value.startsWith('v1:') || value.startsWith('plain:')) {
    return value;
  }

  return encryptSecret(value);
}

function readSecret(value) {
  if (!value) {
    return '';
  }

  try {
    return decryptSecret(value);
  } catch {
    return '';
  }
}

function mapRow(row) {
  return {
    refreshIntervalMs: row.refresh_interval_ms,
    staleCacheMaxMs: row.stale_cache_max_ms,
    dailyLimit: row.daily_limit,
    softBlockThreshold: row.soft_block_threshold,
    maxSavedCities: row.max_saved_cities,
    warningThreshold: row.warning_threshold,
    perMinuteLimit: row.per_minute_limit,
    adsenseClientId: row.adsense_client_id ?? '',
    adsenseSlotDashboard: row.adsense_slot_dashboard ?? '',
    adsenseEnabled: Boolean(row.adsense_enabled ?? 1),
    adsenseOauthRefreshToken: readSecret(row.adsense_oauth_refresh_token ?? ''),
    adsenseAccountName: row.adsense_account_name ?? '',
    adsenseAccountDisplayName: row.adsense_account_display_name ?? '',
    adsenseCurrencyCode: row.adsense_currency_code ?? '',
    adsenseLastSyncedAt: row.adsense_last_synced_at ?? null,
    openWeatherApiKey: readSecret(row.openweather_api_key ?? ''),
    inaccuracyAutoDismissEnabled: Boolean(row.inaccuracy_auto_dismiss_enabled ?? 0),
    inaccuracyAutoDismissDays: Number(row.inaccuracy_auto_dismiss_days ?? 7),
    emailProvider: row.email_provider ?? 'none',
    resendApiKey: readSecret(row.resend_api_key ?? ''),
    resendFromEmail: row.resend_from_email ?? '',
    resendAudienceId: row.resend_audience_id ?? '',
    sendgridApiKey: readSecret(row.sendgrid_api_key ?? ''),
    sendgridFromEmail: row.sendgrid_from_email ?? '',
    sendgridListId: row.sendgrid_list_id ?? '',
    emailLastSyncedAt: row.email_last_synced_at ?? null,
    sesAccessKeyId: row.ses_access_key_id ?? '',
    sesSecretAccessKey: readSecret(row.ses_secret_access_key ?? ''),
    sesRegion: row.ses_region ?? DEFAULT_SES_REGION,
    sesFromEmail: row.ses_from_email ?? '',
    smtpHost: row.smtp_host ?? '',
    smtpPort: Number(row.smtp_port ?? DEFAULT_SMTP_PORT),
    smtpUser: row.smtp_user ?? '',
    smtpPassword: readSecret(row.smtp_password ?? ''),
    smtpFromEmail: row.smtp_from_email ?? '',
    smtpSecure: Boolean(row.smtp_secure ?? 0),
    openMeteoAlertsEnabled: Boolean(row.open_meteo_alerts_enabled ?? 1),
    nwsAlertsEnabled: Boolean(row.nws_alerts_enabled ?? 1),
    windAlertThresholdMs: Number(row.wind_alert_threshold_ms ?? 15),
    weeklyDigestFrequencyDefault: row.weekly_digest_frequency_default ?? 'weekly',
    weeklyDigestDayOfWeek: Number(row.weekly_digest_day_of_week ?? 1),
    updatedAt: row.updated_at,
  };
}

export function getPlatformSettings() {
  const row = getDb().prepare('SELECT * FROM platform_settings WHERE id = 1').get();
  return mapRow(row);
}

export function updatePlatformSettings(partial) {
  const current = getPlatformSettings();
  const next = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString(),
  };

  for (const field of SECRET_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(partial, field)) {
      next[field] = storeSecret(partial[field]);
    } else {
      // Re-store current plaintext via encrypt (migrates legacy plaintext on next full write).
      next[field] = storeSecret(current[field]);
    }
  }

  getDb()
    .prepare(
      `UPDATE platform_settings
       SET refresh_interval_ms = ?,
           stale_cache_max_ms = ?,
           daily_limit = ?,
           soft_block_threshold = ?,
           max_saved_cities = ?,
           warning_threshold = ?,
           per_minute_limit = ?,
           adsense_client_id = ?,
           adsense_slot_dashboard = ?,
           adsense_enabled = ?,
           adsense_oauth_refresh_token = ?,
           adsense_account_name = ?,
           adsense_account_display_name = ?,
           adsense_currency_code = ?,
           adsense_last_synced_at = ?,
           openweather_api_key = ?,
           inaccuracy_auto_dismiss_enabled = ?,
           inaccuracy_auto_dismiss_days = ?,
           email_provider = ?,
           resend_api_key = ?,
           resend_from_email = ?,
           resend_audience_id = ?,
           sendgrid_api_key = ?,
           sendgrid_from_email = ?,
           sendgrid_list_id = ?,
           email_last_synced_at = ?,
           ses_access_key_id = ?,
           ses_secret_access_key = ?,
           ses_region = ?,
           ses_from_email = ?,
           smtp_host = ?,
           smtp_port = ?,
           smtp_user = ?,
           smtp_password = ?,
           smtp_from_email = ?,
           smtp_secure = ?,
           open_meteo_alerts_enabled = ?,
           nws_alerts_enabled = ?,
           wind_alert_threshold_ms = ?,
           weekly_digest_frequency_default = ?,
           weekly_digest_day_of_week = ?,
           updated_at = ?
       WHERE id = 1`,
    )
    .run(
      next.refreshIntervalMs,
      next.staleCacheMaxMs,
      next.dailyLimit,
      next.softBlockThreshold,
      next.maxSavedCities,
      next.warningThreshold,
      next.perMinuteLimit,
      next.adsenseClientId,
      next.adsenseSlotDashboard,
      next.adsenseEnabled ? 1 : 0,
      next.adsenseOauthRefreshToken,
      next.adsenseAccountName,
      next.adsenseAccountDisplayName,
      next.adsenseCurrencyCode,
      next.adsenseLastSyncedAt,
      next.openWeatherApiKey,
      next.inaccuracyAutoDismissEnabled ? 1 : 0,
      next.inaccuracyAutoDismissDays,
      next.emailProvider,
      next.resendApiKey,
      next.resendFromEmail,
      next.resendAudienceId,
      next.sendgridApiKey,
      next.sendgridFromEmail,
      next.sendgridListId,
      next.emailLastSyncedAt,
      next.sesAccessKeyId,
      next.sesSecretAccessKey,
      next.sesRegion || DEFAULT_SES_REGION,
      next.sesFromEmail,
      next.smtpHost,
      Number.isFinite(next.smtpPort) ? next.smtpPort : DEFAULT_SMTP_PORT,
      next.smtpUser,
      next.smtpPassword,
      next.smtpFromEmail,
      next.smtpSecure ? 1 : 0,
      next.openMeteoAlertsEnabled ? 1 : 0,
      next.nwsAlertsEnabled ? 1 : 0,
      next.windAlertThresholdMs,
      next.weeklyDigestFrequencyDefault === 'daily' ? 'daily' : 'weekly',
      Number.isFinite(next.weeklyDigestDayOfWeek) ? next.weeklyDigestDayOfWeek : 1,
      next.updatedAt,
    );

  return getPlatformSettings();
}

export function getPublicPlatformLimits() {
  const settings = getPlatformSettings();

  return {
    maxSavedCities: settings.maxSavedCities,
  };
}
