import { NextResponse } from 'next/server';
import { resolveRegionHint } from '@/lib/geo/resolve-region-hint';

export async function GET(request) {
  const hint = await resolveRegionHint(request);

  if (!hint) {
    return NextResponse.json({ region: null });
  }

  return NextResponse.json({ region: hint });
}
