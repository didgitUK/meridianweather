import { NextResponse } from 'next/server';
import { SITE_ANALYTICS_EVENT_TYPES } from '@/constants/site-analytics';
import { recordSiteAnalyticsEvents } from '@/lib/site-analytics';
import { enforceRateLimit } from '@/lib/server/rate-limit';

export const runtime = 'nodejs';

export async function POST(request) {
  const limited = enforceRateLimit(request, { bucket: 'analytics', limit: 60, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const body = await request.json().catch(() => null);
  const events = Array.isArray(body?.events) ? body.events : null;
  const consent = body?.consent && typeof body.consent === 'object' ? body.consent : {};

  if (!events) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Expected { events: [] }' },
      { status: 400 },
    );
  }

  const analyticsOk = Boolean(consent.analytics);
  const advertisingOk = Boolean(consent.advertising);

  const allowed = events.filter((event) => {
    if (event?.type === SITE_ANALYTICS_EVENT_TYPES.adView) {
      return advertisingOk;
    }
    return analyticsOk;
  });

  if (allowed.length === 0) {
    return NextResponse.json({ accepted: 0, rejected: events.length, consentRequired: true });
  }

  const result = recordSiteAnalyticsEvents(allowed);
  return NextResponse.json(result);
}
