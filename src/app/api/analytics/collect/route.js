import { NextResponse } from 'next/server';
import { SITE_ANALYTICS_EVENT_TYPES } from '@/constants/site-analytics';
import { recordSiteAnalyticsEvents } from '@/lib/site-analytics';
import {
  CONSENT_COOKIE_NAME,
  isSameOriginRequest,
  parseConsentCookieValue,
} from '@/lib/server/consent-cookie';
import { enforceRateLimit } from '@/lib/server/rate-limit';

export const runtime = 'nodejs';

export async function POST(request) {
  const limited = enforceRateLimit(request, { bucket: 'analytics', limit: 60, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: 'forbidden', message: 'Cross-origin analytics are not accepted' },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const events = Array.isArray(body?.events) ? body.events.slice(0, 50) : null;

  if (!events) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Expected { events: [] }' },
      { status: 400 },
    );
  }

  // Trust signed consent cookie only — never body.consent flags.
  const cookieConsent = parseConsentCookieValue(
    request.cookies.get(CONSENT_COOKIE_NAME)?.value,
  );
  const analyticsOk = Boolean(cookieConsent?.analytics);
  const advertisingOk = Boolean(cookieConsent?.advertising);

  const allowed = events.filter((event) => {
    if (event?.type === SITE_ANALYTICS_EVENT_TYPES.adView) {
      return advertisingOk;
    }
    return analyticsOk;
  });

  if (allowed.length === 0) {
    return NextResponse.json({
      accepted: 0,
      rejected: events.length,
      consentRequired: true,
    });
  }

  const result = recordSiteAnalyticsEvents(allowed);
  return NextResponse.json(result);
}
