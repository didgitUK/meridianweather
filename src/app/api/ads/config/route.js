import { NextResponse } from 'next/server';
import { getAdSenseClientId, isAdSenseConfigured } from '@/lib/server/adsense';

export async function GET() {
  const clientId = getAdSenseClientId();

  return NextResponse.json({
    scriptEnabled: isAdSenseConfigured(),
    clientId: clientId || null,
    consentRequired: true,
    provider: 'google-adsense',
  });
}
