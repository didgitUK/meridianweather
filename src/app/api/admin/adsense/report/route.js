import { NextResponse } from 'next/server';
import {
  ADSENSE_DEFAULT_RANGE,
  ADSENSE_REPORT_RANGES,
  ADSENSE_REPORT_STALE_MS,
} from '@/constants/adsense-reports';
import { isAdminRequestAuthorized } from '@/lib/server/admin-auth';
import { getAdSenseReportingAdminConfig } from '@/lib/server/adsense-management';
import {
  getCachedAdSenseReport,
  isAdSenseReportStale,
  syncAdSenseReport,
} from '@/lib/server/adsense-reports';
import { shapeAdSenseReportForAdmin } from '@/lib/server/adsense-report-shape';

function resolveRange(raw) {
  const rangeId = raw && ADSENSE_REPORT_RANGES[raw] ? raw : ADSENSE_DEFAULT_RANGE;
  return rangeId;
}

export async function GET(request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const reporting = getAdSenseReportingAdminConfig();
  const { searchParams } = new URL(request.url);
  const rangeId = resolveRange(searchParams.get('range'));
  const forceSync = searchParams.get('refresh') === '1';

  if (!reporting.connected) {
    return NextResponse.json({
      connected: false,
      reporting,
      rangeId,
      report: null,
      message: 'Connect Google AdSense to load earnings reports.',
    });
  }

  let cached = getCachedAdSenseReport(rangeId);
  let syncError = null;

  if (forceSync || !cached || isAdSenseReportStale(cached.fetchedAt, ADSENSE_REPORT_STALE_MS)) {
    try {
      cached = await syncAdSenseReport(rangeId);
    } catch (error) {
      syncError = error.message || 'Unable to sync AdSense report';
    }
  }

  return NextResponse.json({
    connected: true,
    reporting: getAdSenseReportingAdminConfig(),
    rangeId,
    report: shapeAdSenseReportForAdmin(cached),
    stale: cached ? isAdSenseReportStale(cached.fetchedAt, ADSENSE_REPORT_STALE_MS) : true,
    syncError,
    note: 'Estimated earnings are accurate through yesterday.',
  });
}
