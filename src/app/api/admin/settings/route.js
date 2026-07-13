import { NextResponse } from 'next/server';
import { updatePlatformSettings } from '@/lib/platform-settings';
import { isAdminRequestAuthorized } from '@/lib/server/admin-auth';
import { REFRESH_OPTIONS } from '@/constants/weather';

export async function PATCH(request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const allowed = new Set(REFRESH_OPTIONS.map((option) => option.value));

  if (!allowed.has(body.refreshIntervalMs)) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Unsupported refresh interval' },
      { status: 400 },
    );
  }

  const settings = updatePlatformSettings({
    refreshIntervalMs: body.refreshIntervalMs,
  });

  return NextResponse.json(settings);
}
