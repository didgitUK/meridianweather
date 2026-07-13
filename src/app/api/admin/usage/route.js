import { NextResponse } from 'next/server';
import { getUsageSnapshot } from '@/lib/api-usage-tracker';
import { isAdminRequestAuthorized } from '@/lib/server/admin-auth';

export async function GET(request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  return NextResponse.json(getUsageSnapshot());
}
