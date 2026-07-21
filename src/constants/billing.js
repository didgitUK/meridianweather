/** Ad-free billing plans (placeholder GBP amounts — override via Stripe Price IDs). */

export const ADFEEE_PLANS = Object.freeze({
  monthly: {
    id: 'monthly',
    mode: 'subscription',
    label: 'Monthly',
    amountGbp: 2.99,
    interval: 'month',
    envPriceId: 'STRIPE_PRICE_ADFEEE_MONTHLY',
  },
  annual: {
    id: 'annual',
    mode: 'subscription',
    label: 'Annual',
    amountGbp: 24.99,
    interval: 'year',
    envPriceId: 'STRIPE_PRICE_ADFEEE_ANNUAL',
  },
  lifetime: {
    id: 'lifetime',
    mode: 'payment',
    label: 'Lifetime',
    amountGbp: 79,
    interval: null,
    envPriceId: 'STRIPE_PRICE_ADFEEE_LIFETIME',
  },
});

export const ADFEEE_PLAN_IDS = Object.freeze(Object.keys(ADFEEE_PLANS));

export const ADFEEE_LICENSE_COOKIE = 'meridian_adfree';
export const ADFEEE_LICENSE_MAX_AGE_SEC = 60 * 60 * 24 * 400; // ~13 months

export function formatPlanPriceGbp(plan) {
  if (!plan || plan.amountGbp == null) {
    return '';
  }
  const value = Number(plan.amountGbp);
  const formatted = Number.isInteger(value) ? `£${value}` : `£${value.toFixed(2)}`;
  if (plan.interval === 'month') {
    return `${formatted}/month`;
  }
  if (plan.interval === 'year') {
    return `${formatted}/year`;
  }
  return `${formatted} once`;
}

export function isBillingConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY
    && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    && process.env.ADFEEE_LICENSE_SECRET,
  );
}
