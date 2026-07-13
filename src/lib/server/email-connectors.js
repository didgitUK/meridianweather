import { getPlatformSettings } from '@/lib/platform-settings';
import { maskSecret } from '@/lib/mask-secret';
import { getRecentAdminAuditEvents } from '@/lib/admin-audit-repo';
import {
  DEFAULT_SES_REGION,
  EMAIL_PROVIDERS,
  EMAIL_PROVIDER_OPTIONS,
} from '@/constants/email-providers';

export { EMAIL_PROVIDERS, EMAIL_PROVIDER_OPTIONS, DEFAULT_SES_REGION };

function resolveResendConnector(settings) {
  const databaseKey = settings.resendApiKey?.trim() ?? '';
  const envKey = process.env.RESEND_API_KEY?.trim() ?? '';
  const apiKey = databaseKey || envKey;
  const fromEmail =
    settings.resendFromEmail?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'alerts@meridianweather.co.uk';

  return {
    provider: EMAIL_PROVIDERS.resend,
    apiKey,
    fromEmail,
    audienceId: settings.resendAudienceId?.trim() ?? '',
    source: databaseKey ? 'database' : envKey ? 'environment' : null,
  };
}

function resolveSendgridConnector(settings) {
  const databaseKey = settings.sendgridApiKey?.trim() ?? '';
  const envKey = process.env.SENDGRID_API_KEY?.trim() ?? '';
  const apiKey = databaseKey || envKey;
  const fromEmail =
    settings.sendgridFromEmail?.trim() ||
    process.env.SENDGRID_FROM_EMAIL?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'alerts@meridianweather.co.uk';

  return {
    provider: EMAIL_PROVIDERS.sendgrid,
    apiKey,
    fromEmail,
    audienceId: settings.sendgridListId?.trim() ?? '',
    source: databaseKey ? 'database' : envKey ? 'environment' : null,
  };
}

function resolveSesConnector(settings) {
  const databaseAccessKey = settings.sesAccessKeyId?.trim() ?? '';
  const envAccessKey = process.env.AWS_ACCESS_KEY_ID?.trim() ?? '';
  const accessKeyId = databaseAccessKey || envAccessKey;

  const databaseSecret = settings.sesSecretAccessKey?.trim() ?? '';
  const envSecret = process.env.AWS_SECRET_ACCESS_KEY?.trim() ?? '';
  const apiKey = databaseSecret || envSecret;

  const region =
    settings.sesRegion?.trim() ||
    process.env.AWS_SES_REGION?.trim() ||
    DEFAULT_SES_REGION;

  const fromEmail =
    settings.sesFromEmail?.trim() ||
    process.env.AWS_SES_FROM_EMAIL?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'alerts@meridianweather.co.uk';

  const source = databaseSecret || databaseAccessKey
    ? 'database'
    : envSecret || envAccessKey
      ? 'environment'
      : null;

  return {
    provider: EMAIL_PROVIDERS.ses,
    apiKey,
    accessKeyId,
    region,
    fromEmail,
    audienceId: '',
    source,
  };
}

/**
 * @returns {{
 *   provider: string,
 *   apiKey: string,
 *   fromEmail: string,
 *   audienceId: string,
 *   source: 'database' | 'environment' | null,
 *   accessKeyId?: string,
 *   region?: string,
 * }}
 */
export function resolveActiveEmailConnector() {
  const settings = getPlatformSettings();
  const provider = settings.emailProvider?.trim() || EMAIL_PROVIDERS.resend;

  if (provider === EMAIL_PROVIDERS.sendgrid) {
    return resolveSendgridConnector(settings);
  }

  if (provider === EMAIL_PROVIDERS.ses) {
    return resolveSesConnector(settings);
  }

  return resolveResendConnector(settings);
}

export function isEmailConfigured() {
  const connector = resolveActiveEmailConnector();

  if (connector.provider === EMAIL_PROVIDERS.ses) {
    return Boolean(connector.accessKeyId && connector.apiKey && connector.fromEmail);
  }

  return Boolean(connector.apiKey);
}

function resolveSesAdminSnapshot(settings) {
  const databaseAccessKey = settings.sesAccessKeyId?.trim() ?? '';
  const envAccessKey = process.env.AWS_ACCESS_KEY_ID?.trim() ?? '';
  const accessKeyId = databaseAccessKey || envAccessKey;

  const databaseSecret = settings.sesSecretAccessKey?.trim() ?? '';
  const envSecret = process.env.AWS_SECRET_ACCESS_KEY?.trim() ?? '';
  const secret = databaseSecret || envSecret;

  const region =
    settings.sesRegion?.trim() ||
    process.env.AWS_SES_REGION?.trim() ||
    DEFAULT_SES_REGION;

  const fromEmail =
    settings.sesFromEmail?.trim() || process.env.AWS_SES_FROM_EMAIL?.trim() || '';

  const configured = Boolean(accessKeyId && secret && fromEmail);

  return {
    configured,
    secretConfigured: Boolean(secret),
    source: databaseSecret || databaseAccessKey
      ? 'database'
      : envSecret || envAccessKey
        ? 'environment'
        : null,
    accessKeyIdMasked: maskSecret(accessKeyId),
    accessKeyIdConfigured: Boolean(accessKeyId),
    masked: maskSecret(secret),
    fromEmail,
    region,
    views: getRecentAdminAuditEvents('ses_secret_access_key_viewed', 5),
  };
}

/**
 * Sanitized connector status for admin UI (never includes raw keys).
 */
export function getEmailConnectorsAdminConfig() {
  const settings = getPlatformSettings();

  const resendDb = settings.resendApiKey?.trim() ?? '';
  const resendEnv = process.env.RESEND_API_KEY?.trim() ?? '';
  const resendKey = resendDb || resendEnv;

  const sendgridDb = settings.sendgridApiKey?.trim() ?? '';
  const sendgridEnv = process.env.SENDGRID_API_KEY?.trim() ?? '';
  const sendgridKey = sendgridDb || sendgridEnv;

  const active = resolveActiveEmailConnector();
  const ses = resolveSesAdminSnapshot(settings);

  return {
    emailProvider: settings.emailProvider || EMAIL_PROVIDERS.resend,
    emailLastSyncedAt: settings.emailLastSyncedAt ?? null,
    activeConfigured: isEmailConfigured(),
    activeProvider: active.provider,
    activeFromEmail: active.fromEmail,
    providers: EMAIL_PROVIDER_OPTIONS,
    resend: {
      configured: Boolean(resendKey),
      source: resendDb ? 'database' : resendEnv ? 'environment' : null,
      masked: maskSecret(resendKey),
      fromEmail: settings.resendFromEmail?.trim() || process.env.RESEND_FROM_EMAIL?.trim() || '',
      audienceId: settings.resendAudienceId ?? '',
      views: getRecentAdminAuditEvents('resend_api_key_viewed', 5),
    },
    sendgrid: {
      configured: Boolean(sendgridKey),
      source: sendgridDb ? 'database' : sendgridEnv ? 'environment' : null,
      masked: maskSecret(sendgridKey),
      fromEmail: settings.sendgridFromEmail?.trim() || process.env.SENDGRID_FROM_EMAIL?.trim() || '',
      listId: settings.sendgridListId ?? '',
      views: getRecentAdminAuditEvents('sendgrid_api_key_viewed', 5),
    },
    ses,
  };
}

/**
 * Resolve a revealable secret for an email provider.
 * @param {'resend' | 'sendgrid' | 'ses'} provider
 */
export function resolveProviderApiKey(provider) {
  const settings = getPlatformSettings();

  if (provider === EMAIL_PROVIDERS.sendgrid) {
    const databaseKey = settings.sendgridApiKey?.trim() ?? '';
    const envKey = process.env.SENDGRID_API_KEY?.trim() ?? '';
    if (databaseKey) return { key: databaseKey, source: 'database' };
    if (envKey) return { key: envKey, source: 'environment' };
    return { key: '', source: null };
  }

  if (provider === EMAIL_PROVIDERS.ses) {
    const databaseKey = settings.sesSecretAccessKey?.trim() ?? '';
    const envKey = process.env.AWS_SECRET_ACCESS_KEY?.trim() ?? '';
    if (databaseKey) return { key: databaseKey, source: 'database' };
    if (envKey) return { key: envKey, source: 'environment' };
    return { key: '', source: null };
  }

  const databaseKey = settings.resendApiKey?.trim() ?? '';
  const envKey = process.env.RESEND_API_KEY?.trim() ?? '';
  if (databaseKey) return { key: databaseKey, source: 'database' };
  if (envKey) return { key: envKey, source: 'environment' };
  return { key: '', source: null };
}

/**
 * Per-provider config snapshot used by sidebar connection status.
 */
export function getEmailProviderConnectionSnapshots() {
  const config = getEmailConnectorsAdminConfig();
  const activeId = config.emailProvider;

  return EMAIL_PROVIDER_OPTIONS.map((option) => {
    const moduleConfig =
      option.id === EMAIL_PROVIDERS.resend
        ? config.resend
        : option.id === EMAIL_PROVIDERS.sendgrid
          ? config.sendgrid
          : config.ses;

    return {
      id: `email-${option.id}`,
      providerId: option.id,
      label: option.label,
      active: activeId === option.id,
      configured: Boolean(moduleConfig.configured),
      source: moduleConfig.source ?? null,
    };
  });
}
