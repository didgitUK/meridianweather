import { NextResponse } from 'next/server';
import { getPublicPlatformLimits } from '@/lib/platform-settings';

export async function GET() {
  return NextResponse.json(getPublicPlatformLimits());
}
