import { NextResponse } from 'next/server';
import { AD_PLACEMENTS } from '@/constants/platform';
import { getAdSenseClientId, getAdSenseSlotForPlacement } from '@/lib/server/adsense';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const placement = searchParams.get('placement') ?? AD_PLACEMENTS.dashboard;
  const placements = Object.values(AD_PLACEMENTS);

  if (!placements.includes(placement)) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Unknown ad placement' },
      { status: 400 },
    );
  }

  const clientId = getAdSenseClientId();
  const slotId = getAdSenseSlotForPlacement(placement, placements);
  const scriptEnabled = Boolean(clientId);
  const placementEnabled = scriptEnabled;
  const adTest = process.env.NODE_ENV === 'development' && scriptEnabled;

  return NextResponse.json({
    scriptEnabled,
    placementEnabled,
    provider: 'google-adsense',
    placement,
    clientId: scriptEnabled ? clientId : null,
    slotId: slotId || null,
    format: 'auto',
    fullWidthResponsive: true,
    consentRequired: true,
    adTest,
    testMode: process.env.NODE_ENV === 'development' && !scriptEnabled,
    fallback: {
      label: 'meridian free is supported by advertising',
      href: '/docs/monetization',
    },
  });
}
