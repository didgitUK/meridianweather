import { ADSENSE_OAUTH_SCOPE } from '@/constants/adsense-reports';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

export function getAdSenseOAuthEnv() {
  const clientId = process.env.GOOGLE_ADSENSE_OAUTH_CLIENT_ID?.trim() ?? '';
  const clientSecret = process.env.GOOGLE_ADSENSE_OAUTH_CLIENT_SECRET?.trim() ?? '';
  const redirectUri =
    process.env.GOOGLE_ADSENSE_OAUTH_REDIRECT_URI?.trim() ||
    (process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/api/admin/adsense/oauth/callback`
      : '');

  return {
    clientId,
    clientSecret,
    redirectUri,
    configured: Boolean(clientId && clientSecret && redirectUri),
  };
}

export function buildAdSenseOAuthAuthorizeUrl({ state }) {
  const { clientId, redirectUri, configured } = getAdSenseOAuthEnv();

  if (!configured) {
    throw new Error('AdSense OAuth is not configured. Set GOOGLE_ADSENSE_OAUTH_* env vars.');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: ADSENSE_OAUTH_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeAdSenseOAuthCode(code) {
  const { clientId, clientSecret, redirectUri, configured } = getAdSenseOAuthEnv();

  if (!configured) {
    throw new Error('AdSense OAuth is not configured.');
  }

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error_description || payload.error || 'OAuth token exchange failed');
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token ?? '',
    expiresIn: payload.expires_in,
    scope: payload.scope,
  };
}

export async function refreshAdSenseAccessToken(refreshToken) {
  const { clientId, clientSecret, configured } = getAdSenseOAuthEnv();

  if (!configured) {
    throw new Error('AdSense OAuth is not configured.');
  }

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error_description || payload.error || 'OAuth token refresh failed');
  }

  return {
    accessToken: payload.access_token,
    expiresIn: payload.expires_in,
  };
}
