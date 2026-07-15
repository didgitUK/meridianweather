import { NextResponse } from 'next/server';
import { getSiteAnalyticsOverview } from '@/lib/site-analytics';
import { isAdminRequestAuthorized } from '@/lib/server/admin-auth';

export const runtime = 'nodejs';

export async function GET(request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get('days') || 14);
  const overview = getSiteAnalyticsOverview({ days });

  return NextResponse.json(overview);
}
