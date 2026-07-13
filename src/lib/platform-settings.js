import { getDb } from '@/lib/db';
import { DEFAULT_SES_REGION } from '@/constants/email-providers';

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
    adsenseOauthRefreshToken: row.adsense_oauth_refresh_token ?? '',
    adsenseAccountName: row.adsense_account_name ?? '',
    adsenseAccountDisplayName: row.adsense_account_display_name ?? '',
    adsenseCurrencyCode: row.adsense_currency_code ?? '',
    adsenseLastSyncedAt: row.adsense_last_synced_at ?? null,
    openWeatherApiKey: row.openweather_api_key ?? '',
    inaccuracyAutoDismissEnabled: Boolean(row.inaccuracy_auto_dismiss_enabled ?? 0),
    inaccuracyAutoDismissDays: Number(row.inaccuracy_auto_dismiss_days ?? 7),
    emailProvider: row.email_provider ?? 'resend',
    resendApiKey: row.resend_api_key ?? '',
    resendFromEmail: row.resend_from_email ?? '',
    resendAudienceId: row.resend_audience_id ?? '',
    sendgridApiKey: row.sendgrid_api_key ?? '',
    sendgridFromEmail: row.sendgrid_from_email ?? '',
    sendgridListId: row.sendgrid_list_id ?? '',
    emailLastSyncedAt: row.email_last_synced_at ?? null,
    sesAccessKeyId: row.ses_access_key_id ?? '',
    sesSecretAccessKey: row.ses_secret_access_key ?? '',
    sesRegion: row.ses_region ?? DEFAULT_SES_REGION,
    sesFromEmail: row.ses_from_email ?? '',
    openMeteoAlertsEnabled: Boolean(row.open_meteo_alerts_enabled ?? 1),
    nwsAlertsEnabled: Boolean(row.nws_alerts_enabled ?? 1),
    windAlertThresholdMs: Number(row.wind_alert_threshold_ms ?? 15),
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
           open_meteo_alerts_enabled = ?,
           nws_alerts_enabled = ?,
           wind_alert_threshold_ms = ?,
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
      next.openMeteoAlertsEnabled ? 1 : 0,
      next.nwsAlertsEnabled ? 1 : 0,
      next.windAlertThresholdMs,
      next.updatedAt,
    );

  return next;
}

export function getPublicPlatformLimits() {
  const settings = getPlatformSettings();

  return {
    maxSavedCities: settings.maxSavedCities,
  };
}
