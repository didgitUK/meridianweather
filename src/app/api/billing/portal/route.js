import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADFEEE_LICENSE_COOKIE, isBillingConfigured } from '@/constants/billing';
import { verifyAdFreeLicenseToken } from '@/lib/billing/license';
import { getAppOrigin, getStripe } from '@/lib/billing/stripe';

export async function POST(request) {
  if (!isBillingConfigured()) {
    return NextResponse.json({ error: 'Billing is not configured' }, { status: 503 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is unavailable' }, { status: 503 });
  }

  const jar = await cookies();
  const license = verifyAdFreeLicenseToken(jar.get(ADFEEE_LICENSE_COOKIE)?.value);
  if (!license?.stripeCustomerId) {
    return NextResponse.json(
      { error: 'No Stripe customer on this device. Restore your license first.' },
      { status: 401 },
    );
  }

  const origin = getAppOrigin(request);
  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: license.stripeCustomerId,
      return_url: `${origin}/`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || 'Unable to open billing portal' },
      { status: 502 },
    );
  }
}
