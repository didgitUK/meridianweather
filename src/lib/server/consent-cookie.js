import crypto from 'crypto';

export const CONSENT_COOKIE_NAME = 'meridian_consent';
const CONSENT_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

function getConsentSigningSecret() {
  return (
    process.env.ADMIN_SECRET?.trim()
    || process.env.CONSENT_COOKIE_SECRET?.trim()
    || ''
  );
}

/**
 * @param {{ analytics?: boolean, advertising?: boolean }} flags
 * @returns {string | null}
 */
export function createConsentCookieValue(flags) {
  const secret = getConsentSigningSecret();
  if (!secret) {
    return null;
  }

  const payload = Buffer.from(
    JSON.stringify({
      a: Boolean(flags?.analytics),
      d: Boolean(flags?.advertising),
      t: Date.now(),
    }),
  ).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

/**
 * @param {string | undefined | null} token
 * @returns {{ analytics: boolean, advertising: boolean } | null}
 */
export function parseConsentCookieValue(token) {
  const secret = getConsentSigningSecret();
  if (!secret || !token) {
    return null;
  }

  const [payload, signature] = String(token).split('.');
  if (!payload || !signature) {
    return null;
  }

  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const received = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    received.length !== expectedBuffer.length
    || !crypto.timingSafeEqual(received, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return {
      analytics: Boolean(parsed.a),
      advertising: Boolean(parsed.d),
    };
  } catch {
    return null;
  }
}

export function getConsentCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: CONSENT_MAX_AGE_SECONDS,
  };
}

/**
 * Same-origin check for analytics beacon (blocks cross-site event injection).
 * @param {Request} request
 * @returns {boolean}
 */
export function isSameOriginRequest(request) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? '').trim();
  let allowedHost = null;
  if (appUrl) {
    try {
      allowedHost = new URL(appUrl).host;
    } catch {
      allowedHost = null;
    }
  }

  const origin = request.headers.get('origin');
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (allowedHost && originHost === allowedHost) {
        return true;
      }
      if (!allowedHost && (originHost === 'localhost:3000' || originHost.endsWith('.localhost'))) {
        return true;
      }
    } catch {
      return false;
    }
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      if (allowedHost && refererHost === allowedHost) {
        return true;
      }
      if (!allowedHost && (refererHost === 'localhost:3000' || refererHost.startsWith('localhost:'))) {
        return true;
      }
    } catch {
      return false;
    }
  }

  // sendBeacon may omit Origin on some browsers; allow when Host matches app host.
  const host = request.headers.get('host');
  if (host && allowedHost && host === allowedHost) {
    return true;
  }
  if (host && !allowedHost && (host === 'localhost:3000' || host.startsWith('localhost:'))) {
    return true;
  }

  return false;
}
