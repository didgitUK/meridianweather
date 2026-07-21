import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  ADFEEE_LICENSE_COOKIE,
  ADFEEE_LICENSE_MAX_AGE_SEC,
  isBillingConfigured,
} from '@/constants/billing';
import {
  createAdFreeLicenseToken,
  verifyRestoreToken,
} from '@/lib/billing/license';
import { findAdFreeLicenseByEmail } from '@/lib/billing/adfree-licenses-repo';

export async function POST(request) {
  if (!isBillingConfigured()) {
    return NextResponse.json({ error: 'Billing is not configured' }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const token = String(body?.token || '');
  const payload = verifyRestoreToken(token);
  if (!payload?.email) {
    return NextResponse.json({ error: 'Invalid or expired restore link' }, { status: 400 });
  }

  const license = findAdFreeLicenseByEmail(payload.email);
  if (!license || license.status !== 'active') {
    return NextResponse.json({ error: 'No active license for this email' }, { status: 404 });
  }

  const cookieValue = createAdFreeLicenseToken({
    email: license.email,
    plan: license.plan,
    status: license.status,
    expiresAt: license.expiresAt,
    stripeCustomerId: license.stripeCustomerId,
  });

  const jar = await cookies();
  jar.set(ADFEEE_LICENSE_COOKIE, cookieValue, {
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
}
