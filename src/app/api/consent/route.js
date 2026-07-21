import { NextResponse } from 'next/server';
import {
  CONSENT_COOKIE_NAME,
  createConsentCookieValue,
  getConsentCookieOptions,
} from '@/lib/server/consent-cookie';
import { enforceRateLimit } from '@/lib/server/rate-limit';

export const runtime = 'nodejs';

export async function POST(request) {
  const limited = enforceRateLimit(request, { bucket: 'consent', limit: 30, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const body = await request.json().catch(() => null);
  const analytics = Boolean(body?.analytics);
  const advertising = Boolean(body?.advertising);

  const value = createConsentCookieValue({ analytics, advertising });
  if (!value) {
    return NextResponse.json(
      { ok: false, message: 'Consent cookie signing is not configured' },
      { status: 503 },
    );
  }

  const response = NextResponse.json({ ok: true, analytics, advertising });
  response.cookies.set(CONSENT_COOKIE_NAME, value, getConsentCookieOptions());
  return response;
}

export async function DELETE(request) {
  const limited = enforceRateLimit(request, { bucket: 'consent', limit: 30, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(CONSENT_COOKIE_NAME, '', {
    ...getConsentCookieOptions(),
    maxAge: 0,
  });
  return response;
}
