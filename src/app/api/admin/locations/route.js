import { NextResponse } from 'next/server';
import { getAdminLocationHistoryDetail } from '@/lib/admin-location-history';
import { seedDemoLocationHistory } from '@/lib/location-history-seed';
import {
  clearInaccurateReport,
  getLocationSummary,
  listLocations,
} from '@/lib/location-repo';
import { isAdminRequestAuthorized } from '@/lib/server/admin-auth';

export async function GET(request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get('locationId');

  if (locationId) {
    const detail = getAdminLocationHistoryDetail(locationId);

    if (!detail) {
      return NextResponse.json({ error: 'not_found', message: 'Location not found' }, { status: 404 });
    }

    return NextResponse.json(detail);
  }

  return NextResponse.json({
    locations: listLocations({ limit: 100 }),
  });
}

export async function POST(request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const locationId = body.locationId;

  if (!locationId || typeof locationId !== 'string') {
    return NextResponse.json(
      { error: 'invalid_request', message: 'locationId is required' },
      { status: 400 },
    );
  }

  if (body.action === 'seed-demo') {
    const location = getLocationSummary(locationId);

    if (!location) {
      return NextResponse.json({ error: 'not_found', message: 'Location not found' }, { status: 404 });
    }

    const seeded = seedDemoLocationHistory(location.lat, location.lon);
    const detail = getAdminLocationHistoryDetail(locationId);

    return NextResponse.json({
      seeded,
      detail,
    });
  }

  return NextResponse.json(
    { error: 'invalid_request', message: 'Unsupported action' },
    { status: 400 },
  );
}

export async function PATCH(request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const locationId = body.locationId;

  if (!locationId || typeof locationId !== 'string') {
    return NextResponse.json(
      { error: 'invalid_request', message: 'locationId is required' },
      { status: 400 },
    );
  }

  if (body.inaccurateReportActive !== false) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Only clearing inaccurate reports is supported' },
      { status: 400 },
    );
  }

  const location = clearInaccurateReport(locationId);

  if (!location) {
    return NextResponse.json({ error: 'not_found', message: 'Location not found' }, { status: 404 });
  }

  return NextResponse.json({ location });
}
