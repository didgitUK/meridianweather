import { NextResponse } from 'next/server';
import { getRecentChecksPayload } from '@/lib/weather/recent-checks';
import { apiErrorFromCaught } from '@/lib/server/api-response';

export async function GET() {
  try {
    const payload = await getRecentChecksPayload();
    return NextResponse.json(payload);
  } catch (error) {
    return apiErrorFromCaught(error, { error: 'upstream_error', status: 500 });
  }
}
