import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  ADFEEE_LICENSE_COOKIE,
  isBillingConfigured,
} from '@/constants/billing';
import { verifyAdFreeLicenseToken } from '@/lib/billing/license';

export async function GET() {
  const jar = await cookies();
  const token = jar.get(ADFEEE_LICENSE_COOKIE)?.value ?? null;
  const license = verifyAdFreeLicenseToken(token);

  return NextResponse.json({
    billingEnabled: isBillingConfigured() && Boolean(process.env.STRIPE_SECRET_KEY),
    license: license
      ? {
          isAdFree: true,
          email: license.email,
          plan: license.plan,
          expiresAt: license.expiresAt,
        }
      : null,
  });
}
