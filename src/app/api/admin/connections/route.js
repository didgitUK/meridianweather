import { NextResponse } from 'next/server';
import { isAdminRequestAuthorized } from '@/lib/server/admin-auth';
import { getAdminConnectionStatuses } from '@/lib/server/admin-connections';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function GET(request) {
  if (!isAdminRequestAuthorized(request)) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const force = searchParams.get('force') === '1';

  const payload = await getAdminConnectionStatuses({ force });
  return NextResponse.json(payload);
}
