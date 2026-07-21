import { NextResponse } from 'next/server';
import { deletePushSubscriptionByEndpoint } from '@/lib/db/repositories/push-subscriptions';
import { apiError } from '@/lib/server/api-response';
import { enforceRateLimit } from '@/lib/server/rate-limit';

export async function POST(request) {
  const limited = enforceRateLimit(request, { bucket: 'push-unsubscribe', limit: 30, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError('invalid_request', 'Invalid JSON body', 400);
  }

  const endpoint = typeof body?.endpoint === 'string' ? body.endpoint.trim() : '';
  if (!endpoint) {
    return apiError('invalid_request', 'endpoint is required', 400);
  }

  deletePushSubscriptionByEndpoint(endpoint);
  return NextResponse.json({ ok: true });
}
