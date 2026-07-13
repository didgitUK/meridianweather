import { NextResponse } from 'next/server';
import {
  getAdminChecksLog,
  getChecksAnalytics,
} from '@/lib/admin-checks-analytics';
import { isAdminRequestAuthorized } from '@/lib/server/admin-auth';

export async function GET(request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view') ?? 'log';

  if (view === 'analytics') {
    const days = Number(searchParams.get('days') ?? 14);
    return NextResponse.json(getChecksAnalytics({ days }));
  }

  const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit') ?? 50)));
  const offset = Math.max(0, Number(searchParams.get('offset') ?? 0));
  const upstreamOnly = searchParams.get('upstreamOnly') === '1'
    || searchParams.get('upstreamOnly') === 'true';

  const payload = getAdminChecksLog({
    trigger: searchParams.get('trigger') ?? undefined,
    locationId: searchParams.get('locationId') ?? undefined,
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
    upstreamOnly,
    limit,
    offset,
  });

  return NextResponse.json({
    ...payload,
    limit,
    offset,
  });
}
