import Stripe from 'stripe';
import { ADFEEE_PLANS } from '@/constants/billing';

let stripeClient = null;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }

  return stripeClient;
}

export function getStripePriceId(planId) {
  const plan = ADFEEE_PLANS[planId];
  if (!plan) {
    return null;
  }
  return process.env[plan.envPriceId] || null;
}

export function getAppOrigin(request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  if (configured) {
    return configured;
  }
  if (request?.headers) {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    if (host) {
      return `${proto}://${host}`;
    }
  }
  return 'http://localhost:3000';
}
