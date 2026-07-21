import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  ADFEEE_LICENSE_COOKIE,
  ADFEEE_LICENSE_MAX_AGE_SEC,
  isBillingConfigured,
} from '@/constants/billing';
import { createAdFreeLicenseToken } from '@/lib/billing/license';
import {
  findAdFreeLicenseByEmail,
  findAdFreeLicenseBySessionId,
  upsertAdFreeLicense,
} from '@/lib/billing/adfree-licenses-repo';
import { getStripe } from '@/lib/billing/stripe';

export async function POST(request) {
  if (!isBillingConfigured()) {
    return NextResponse.json({ error: 'Billing is not configured' }, { status: 503 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is unavailable' }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const sessionId = String(body?.sessionId || '');
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return NextResponse.json({ error: 'Checkout not completed' }, { status: 402 });
    }

    const email = (session.customer_details?.email || session.customer_email || '')
      .trim()
      .toLowerCase();
    const plan = session.metadata?.meridian_plan || 'monthly';
    if (!email) {
      return NextResponse.json({ error: 'Checkout email missing' }, { status: 422 });
    }

    let license = findAdFreeLicenseBySessionId(sessionId) || findAdFreeLicenseByEmail(email);
    if (!license || license.status !== 'active') {
      license = upsertAdFreeLicense({
        email,
        plan,
        status: 'active',
        stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
        stripeSubscriptionId:
          typeof session.subscription === 'string' ? session.subscription : null,
        stripeSessionId: sessionId,
        expiresAt: plan === 'lifetime' ? null : license?.expiresAt ?? null,
      });
    }

    const token = createAdFreeLicenseToken({
      email: license.email,
      plan: license.plan,
      status: license.status,
      expiresAt: license.expiresAt,
      stripeCustomerId: license.stripeCustomerId,
    });

    const jar = await cookies();
    jar.set(ADFEEE_LICENSE_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: ADFEEE_LICENSE_MAX_AGE_SEC,
    });

    return NextResponse.json({
      ok: true,
      license: {
        isAdFree: true,
        email: license.email,
        plan: license.plan,
        expiresAt: license.expiresAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || 'Unable to issue license' },
      { status: 502 },
    );
  }
}
