import { NextResponse } from 'next/server';
import { apiError } from '@/lib/server/api-response';
import { getVapidConfig } from '@/lib/server/web-push';

export async function GET() {
  const config = getVapidConfig();
  if (!config) {
    return apiError('unavailable', 'Web Push is not configured', 503);
  }

  return NextResponse.json({ publicKey: config.publicKey });
}
