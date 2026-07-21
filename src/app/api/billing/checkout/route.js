import { NextResponse } from 'next/server';
import { ADFEEE_PLAN_IDS, ADFEEE_PLANS, isBillingConfigured } from '@/constants/billing';
import { getAppOrigin, getStripe, getStripePriceId } from '@/lib/billing/stripe';

export async function POST(request) {
  if (!isBillingConfigured()) {
    return NextResponse.json(
      { error: 'Billing is not configured yet. Stripe keys are required.' },
      { status: 503 },
    );
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

  const planId = String(body?.plan || '');
  if (!ADFEEE_PLAN_IDS.includes(planId)) {
    return NextResponse.json({ error: 'Unknown plan' }, { status: 400 });
  }

  const priceId = getStripePriceId(planId);
  if (!priceId) {
    return NextResponse.json(
      { error: `Missing Stripe price for ${planId}. Set ${ADFEEE_PLANS[planId].envPriceId}.` },
      { status: 503 },
    );
  }

  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const origin = getAppOrigin(request);
  const plan = ADFEEE_PLANS[planId];

  try {
    const session = await stripe.checkout.sessions.create({
      mode: plan.mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing/cancel`,
      customer_email: email || undefined,
      allow_promotion_codes: true,
      metadata: {
        meridian_plan: planId,
      },
      subscription_data: plan.mode === 'subscription'
        ? { metadata: { meridian_plan: planId } }
        : undefined,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || 'Unable to start checkout' },
      { status: 502 },
    );
  }
}
