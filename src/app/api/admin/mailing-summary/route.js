import { NextResponse } from 'next/server';
import { getSubscriptionSummary } from '@/lib/db/repositories/subscriptions';
import { isAdminRequestAuthorized } from '@/lib/server/admin-auth';

export const runtime = 'nodejs';

export async function GET(request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    summary: getSubscriptionSummary(),
  });
}
