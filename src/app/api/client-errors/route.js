import { NextResponse } from 'next/server';
import { logErrorEvent } from '@/lib/error-log-repo';
import { enforceRateLimit } from '@/lib/server/rate-limit';

/**
 * Browser / React error boundary reports (rate-limited).
 */
export async function POST(request) {
  const limited = enforceRateLimit(request, {
    bucket: 'client-errors',
    limit: 30,
    windowMs: 60_000,
  });
  if (limited) {
    return limited;
  }

  try {
    const body = await request.json();
    const message = String(body.message ?? 'Client error').slice(0, 1000);
    const stack = body.stack ? String(body.stack).slice(0, 4000) : null;
    const digest = body.digest ? String(body.digest).slice(0, 200) : null;
    const path = body.path ? String(body.path).slice(0, 500) : null;

    logErrorEvent({
      level: 'error',
      source: 'client',
      message,
      stack,
      meta: {
        digest,
        path,
        userAgent: request.headers.get('user-agent')?.slice(0, 300) ?? undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Unable to record client error' },
      { status: 400 },
    );
  }
}
