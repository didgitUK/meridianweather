import { NextResponse } from 'next/server';
import { createAdminPasswordReset } from '@/lib/admin-password-resets-repo';
import { getAdminUserByEmail } from '@/lib/admin-users-repo';
import { sendAdminForgotPasswordEmail } from '@/lib/email';
import { enforceRateLimit } from '@/lib/server/rate-limit';

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

function formatExpiresAt(iso) {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

/**
 * Always returns ok to avoid email enumeration.
 */
export async function POST(request) {
  const limited = enforceRateLimit(request, { bucket: 'auth-forgot', limit: 5, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const body = await request.json().catch(() => ({}));
  const email = body.email?.trim()?.toLowerCase() ?? '';

  if (!email) {
    return NextResponse.json(
      { error: 'validation', message: 'Email is required' },
      { status: 400 },
    );
  }

  const user = getAdminUserByEmail(email);

  if (user && user.active) {
    const reset = createAdminPasswordReset({ userId: user.id });
    const resetUrl = `${getAppUrl()}/reset-password/${reset.token}`;

    try {
      await sendAdminForgotPasswordEmail({
        email: user.email,
        displayName: user.display_name,
        resetUrl,
        expiresAt: formatExpiresAt(reset.expiresAt),
      });
    } catch {
      // Still return generic success.
    }
  }

  return NextResponse.json({
    ok: true,
    message: 'If an account exists for that email, a reset link has been sent.',
  });
}
