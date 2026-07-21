import { NextResponse } from 'next/server';
import { ADFEEE_PLANS, isBillingConfigured } from '@/constants/billing';
import {
  setAdFreeLicenseStatus,
  upsertAdFreeLicense,
} from '@/lib/billing/adfree-licenses-repo';
import { getStripe } from '@/lib/billing/stripe';

export const runtime = 'nodejs';

function planFromSession(session) {
  return session?.metadata?.meridian_plan
    || session?.subscription_details?.metadata?.meridian_plan
    || 'monthly';
}

export async function POST(request) {
  if (!isBillingConfigured()) {
    return NextResponse.json({ error: 'Billing is not configured' }, { status: 503 });
  }

  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      { error: `Webhook signature failed: ${error.message}` },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const email = (session.customer_details?.email || session.customer_email || '')
          .trim()
          .toLowerCase();
        if (email) {
          const plan = planFromSession(session);
          upsertAdFreeLicense({
            email,
            plan,
            status: 'active',
            stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
            stripeSubscriptionId:
              typeof session.subscription === 'string' ? session.subscription : null,
            stripeSessionId: session.id,
            expiresAt: plan === 'lifetime' ? null : null,
          });
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = typeof subscription.customer === 'string'
          ? subscription.customer
          : null;
        if (!customerId) {
          break;
        }
        const customer = await stripe.customers.retrieve(customerId);
        const email = customer?.email?.trim().toLowerCase();
        if (!email) {
          break;
        }
        const active = subscription.status === 'active' || subscription.status === 'trialing';
        const plan = subscription.metadata?.meridian_plan
          || Object.keys(ADFEEE_PLANS).find((id) => ADFEEE_PLANS[id].mode === 'subscription')
          || 'monthly';
        if (active) {
          upsertAdFreeLicense({
            email,
            plan,
            status: 'active',
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            expiresAt: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
          });
        } else {
          setAdFreeLicenseStatus(email, 'canceled', {
            expiresAt: new Date().toISOString(),
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || 'Webhook handler failed' },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
