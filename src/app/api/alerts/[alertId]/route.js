import { NextResponse } from 'next/server';
import { fetchAlert } from '@/lib/weather-fetch-orchestrator';

export async function GET(_request, { params }) {
  try {
    const { alertId } = await params;
    const response = await fetchAlert(alertId);
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      { error: 'upstream_error', message: error.message },
      { status: 502 },
    );
  }
}
