import { NextResponse } from 'next/server';
import { isAdminRequestAuthorized } from '@/lib/server/admin-auth';
import { clearAdSenseReportSnapshots } from '@/lib/server/adsense-reports';
import { updatePlatformSettings } from '@/lib/platform-settings';
import { getAdSenseReportingAdminConfig } from '@/lib/server/adsense-management';

export async function POST(request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  updatePlatformSettings({
    adsenseOauthRefreshToken: '',
    adsenseAccountName: '',
    adsenseAccountDisplayName: '',
    adsenseCurrencyCode: '',
    adsenseLastSyncedAt: null,
  });
  clearAdSenseReportSnapshots();

  return NextResponse.json({
    ok: true,
    reporting: getAdSenseReportingAdminConfig(),
  });
}
