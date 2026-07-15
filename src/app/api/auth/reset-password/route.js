import { NextResponse } from 'next/server';
import {
  getPasswordResetByToken,
  markPasswordResetUsedIfValid,
} from '@/lib/admin-password-resets-repo';
import { getAdminUserById, updateAdminUserPassword } from '@/lib/admin-users-repo';
import { logAdminAuditEvent } from '@/lib/admin-audit-repo';
import { sendAdminPasswordChangedEmail } from '@/lib/email';
import { validatePasswordPolicy } from '@/lib/server/password';
import { enforceRateLimit } from '@/lib/server/rate-limit';

const GENERIC_INVALID =
  'This reset link is invalid or has expired. Request a new one if you still need access.';

export async function POST(request) {
  const limited = enforceRateLimit(request, { bucket: 'auth-reset', limit: 10, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const body = await request.json().catch(() => ({}));
  const token = body.token?.trim() ?? '';
  const password = body.password?.trim() ?? '';

  if (!token) {
    return NextResponse.json({ error: 'validation', message: 'Token is required' }, { status: 400 });
  }

  const policy = validatePasswordPolicy(password);
  if (!policy.ok) {
    return NextResponse.json({ error: 'validation', message: policy.message }, { status: 400 });
  }

  const row = getPasswordResetByToken(token);
  if (!row) {
    return NextResponse.json({ error: 'invalid_token', message: GENERIC_INVALID }, { status: 400 });
  }

  const user = getAdminUserById(row.user_id);
  if (!user || !user.active) {
    return NextResponse.json({ error: 'invalid_token', message: GENERIC_INVALID }, { status: 400 });
  }

  const claimed = markPasswordResetUsedIfValid(row.id);
  if (!claimed) {
    return NextResponse.json({ error: 'invalid_token', message: GENERIC_INVALID }, { status: 400 });
  }

  updateAdminUserPassword(row.user_id, password);

  try {
    await sendAdminPasswordChangedEmail({
      email: user.email,
      displayName: user.display_name,
    });
  } catch {
    // Password already updated.
  }

  logAdminAuditEvent({
    action: 'admin_password_reset_completed',
    meta: { userId: row.user_id },
  });

  return NextResponse.json({ ok: true });
}
