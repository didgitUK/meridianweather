import { NextResponse } from 'next/server';
import {
  ADSENSE_DEFAULT_RANGE,
  ADSENSE_OAUTH_STATE_COOKIE,
} from '@/constants/adsense-reports';
import { isAdminRequestAuthorized } from '@/lib/server/admin-auth';
import { exchangeAdSenseOAuthCode } from '@/lib/server/adsense-oauth';
import { listAdSenseAccounts } from '@/lib/server/adsense-management';
import { encryptSecret } from '@/lib/server/secret-crypto';
import { updatePlatformSettings } from '@/lib/platform-settings';
import { syncAdSenseReport } from '@/lib/server/adsense-reports';

function adminAdSenseRedirect(request, query) {
  const requestUrl = new URL(request.url);
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || `${requestUrl.protocol}//${requestUrl.host}`;
  const referer = request.headers.get('referer');
  let localePrefix = '';

  try {
    if (referer) {
      const path = new URL(referer).pathname;
      const match = path.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)(?:\/|$)/);
      if (match && match[1] !== 'api') {
        localePrefix = `/${match[1]}`;
      }
    }
  } catch {
    // Ignore referer parse errors.
  }

  const url = new URL(`${base}${localePrefix}/admin`);
  url.searchParams.set('section', 'adsense');

  for (const [key, value] of Object.entries(query)) {
    if (value != null) {
      url.searchParams.set(key, value);
    }
  }

  return url;
}

export async function GET(request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const oauthError = searchParams.get('error');
  const cookieState = request.cookies.get(ADSENSE_OAUTH_STATE_COOKIE)?.value;

  if (oauthError) {
    const response = NextResponse.redirect(
      adminAdSenseRedirect(request, { adsense_error: oauthError }),
    );
    response.cookies.delete(ADSENSE_OAUTH_STATE_COOKIE);
    return response;
  }

  if (!code || !state || !cookieState || state !== cookieState) {
    const response = NextResponse.redirect(
      adminAdSenseRedirect(request, { adsense_error: 'invalid_state' }),
    );
    response.cookies.delete(ADSENSE_OAUTH_STATE_COOKIE);
    return response;
  }

  try {
    const tokens = await exchangeAdSenseOAuthCode(code);

    if (!tokens.refreshToken) {
      const response = NextResponse.redirect(
        adminAdSenseRedirect(request, { adsense_error: 'missing_refresh_token' }),
      );
      response.cookies.delete(ADSENSE_OAUTH_STATE_COOKIE);
      return response;
    }

    const accounts = await listAdSenseAccounts(tokens.accessToken);
    const primary = accounts[0];

    updatePlatformSettings({
      adsenseOauthRefreshToken: encryptSecret(tokens.refreshToken),
      adsenseAccountName: primary?.name ?? '',
      adsenseAccountDisplayName: primary?.displayName ?? primary?.name ?? '',
      adsenseCurrencyCode: primary?.currencyCode ?? '',
    });

    try {
      await syncAdSenseReport(ADSENSE_DEFAULT_RANGE);
    } catch {
      // Connection succeeded; report sync can be retried from the UI.
    }

    const response = NextResponse.redirect(
      adminAdSenseRedirect(request, { adsense: 'connected' }),
    );
    response.cookies.delete(ADSENSE_OAUTH_STATE_COOKIE);
    return response;
  } catch (error) {
    const response = NextResponse.redirect(
      adminAdSenseRedirect(request, {
        adsense_error: error.message || 'oauth_failed',
      }),
    );
    response.cookies.delete(ADSENSE_OAUTH_STATE_COOKIE);
    return response;
  }
}
