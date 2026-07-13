import { NextResponse } from 'next/server';
import {
  activateInaccurateReport,
  getInaccurateReportStatus,
} from '@/lib/location-repo';
import { parseLatLon } from '@/lib/validators';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const { lat, lon } = parseLatLon(searchParams.get('lat'), searchParams.get('lon'));

    return NextResponse.json(getInaccurateReportStatus(lat, lon));
  } catch (error) {
    const message = error.message ?? 'Unable to load report status';
    const status = message.startsWith('Invalid') ? 400 : 502;

    return NextResponse.json({ error: 'report_status_error', message }, { status });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { lat, lon } = parseLatLon(body.lat, body.lon);

    const status = activateInaccurateReport(lat, lon, {
      name: body.name ?? null,
      country: body.country ?? null,
      state: body.state ?? null,
      label: body.label ?? null,
    });

    return NextResponse.json(status);
  } catch (error) {
    const message = error.message ?? 'Unable to submit report';
    const status = message.startsWith('Invalid') ? 400 : 502;

    return NextResponse.json({ error: 'report_submit_error', message }, { status });
  }
}
