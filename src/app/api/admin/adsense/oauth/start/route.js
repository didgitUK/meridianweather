import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { ADSENSE_OAUTH_STATE_COOKIE } from '@/constants/adsense-reports';
import { isAdminRequestAuthorized } from '@/lib/server/admin-auth';
import { buildAdSenseOAuthAuthorizeUrl, getAdSenseOAuthEnv } from '@/lib/server/adsense-oauth';

export async function GET(request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const env = getAdSenseOAuthEnv();

  if (!env.configured) {
    return NextResponse.json(
      {
        error: 'not_configured',
        message:
          'Set GOOGLE_ADSENSE_OAUTH_CLIENT_ID, GOOGLE_ADSENSE_OAUTH_CLIENT_SECRET, and redirect URI.',
      },
      { status: 400 },
    );
  }

  const state = randomBytes(24).toString('base64url');
  const authorizeUrl = buildAdSenseOAuthAuthorizeUrl({ state });
  const response = NextResponse.redirect(authorizeUrl);

  response.cookies.set(ADSENSE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  return response;
}
