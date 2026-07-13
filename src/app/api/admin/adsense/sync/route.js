import { NextResponse } from 'next/server';
import {
  ADSENSE_DEFAULT_RANGE,
  ADSENSE_REPORT_RANGES,
} from '@/constants/adsense-reports';
import { isAdminRequestAuthorized } from '@/lib/server/admin-auth';
import { getAdSenseReportingAdminConfig } from '@/lib/server/adsense-management';
import { syncAdSenseReport } from '@/lib/server/adsense-reports';
import { shapeAdSenseReportForAdmin } from '@/lib/server/adsense-report-shape';

export async function POST(request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const reporting = getAdSenseReportingAdminConfig();

  if (!reporting.connected) {
    return NextResponse.json(
      { error: 'not_connected', message: 'Connect Google AdSense first.' },
      { status: 400 },
    );
  }

  let rangeId = ADSENSE_DEFAULT_RANGE;

  try {
    const body = await request.json().catch(() => ({}));
    if (body?.range && ADSENSE_REPORT_RANGES[body.range]) {
      rangeId = body.range;
    }
  } catch {
    // Default range.
  }

  try {
    const cached = await syncAdSenseReport(rangeId);

    return NextResponse.json({
      ok: true,
      reporting: getAdSenseReportingAdminConfig(),
      rangeId,
      report: shapeAdSenseReportForAdmin(cached),
      note: 'Estimated earnings are accurate through yesterday.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'sync_failed', message: error.message || 'AdSense sync failed' },
      { status: 502 },
    );
  }
}
