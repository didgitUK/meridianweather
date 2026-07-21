import { NextResponse } from 'next/server';
import { isBillingConfigured } from '@/constants/billing';
import { createRestoreToken } from '@/lib/billing/license';
import { findAdFreeLicenseByEmail } from '@/lib/billing/adfree-licenses-repo';
import { getAppOrigin } from '@/lib/billing/stripe';
import { sendTransactionalEmail } from '@/lib/server/email-provider';

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

  const email = String(body?.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const license = findAdFreeLicenseByEmail(email);
  // Always return a generic success to avoid email enumeration.
  if (!license || license.status !== 'active') {
    return NextResponse.json({
      ok: true,
      message: 'If an active ad-free license exists for that email, a restore link is on its way.',
    });
  }

  const token = createRestoreToken(email);
  const origin = getAppOrigin(request);
  const restoreUrl = `${origin}/billing/restore?token=${encodeURIComponent(token)}`;

  try {
    await sendTransactionalEmail({
      to: email,
      subject: 'Restore your Meridian ad-free access',
      html: `
        <p>Use this link to restore ad-free browsing on this device (expires in 30 minutes):</p>
        <p><a href="${restoreUrl}">${restoreUrl}</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
      templateSlug: 'adfree-restore',
    });
  } catch {
    // Still acknowledge — operator can check logs; avoid leaking config state.
  }

  return NextResponse.json({
    ok: true,
    message: 'If an active ad-free license exists for that email, a restore link is on its way.',
  });
}
