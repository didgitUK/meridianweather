import { NextResponse } from 'next/server';
import { getInviteByToken, markInviteAccepted } from '@/lib/admin-invites-repo';
import { createAdminUser, getAdminUserByEmail } from '@/lib/admin-users-repo';
import { logAdminAuditEvent } from '@/lib/admin-audit-repo';
import { sendAdminWelcomeEmail } from '@/lib/email';
import { validatePasswordPolicy } from '@/lib/server/password';
import { enforceRateLimit } from '@/lib/server/rate-limit';

function inviteStatus(row) {
  if (!row) {
    return { ok: false, status: 404, error: 'not_found', message: 'Invite not found' };
  }

  if (row.accepted_at) {
    return { ok: false, status: 410, error: 'accepted', message: 'This invite has already been used' };
  }

  if (new Date(row.expires_at).getTime() <= Date.now()) {
    return { ok: false, status: 410, error: 'expired', message: 'This invite has expired' };
  }

  return { ok: true };
}

export async function GET(_request, { params }) {
  const { token } = await params;
  const row = getInviteByToken(token);
  const status = inviteStatus(row);

  if (!status.ok) {
    return NextResponse.json(
      { error: status.error, message: status.message },
      { status: status.status },
    );
  }

  return NextResponse.json({
    invite: {
      email: row.email,
      displayName: row.display_name,
      expiresAt: row.expires_at,
    },
  });
}

export async function POST(request, { params }) {
  const limited = enforceRateLimit(request, { bucket: 'auth-invite', limit: 10, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const { token } = await params;
  const row = getInviteByToken(token);
  const status = inviteStatus(row);

  if (!status.ok) {
    return NextResponse.json(
      { error: status.error, message: status.message },
      { status: status.status },
    );
  }

  if (getAdminUserByEmail(row.email)) {
    return NextResponse.json(
      { error: 'conflict', message: 'An admin with this email already exists' },
      { status: 409 },
    );
  }

  const body = await request.json();
  const password = body.password?.trim() ?? '';
  const displayName = (body.displayName?.trim() || row.display_name || '').trim();

  const policy = validatePasswordPolicy(password);
  if (!policy.ok) {
    return NextResponse.json(
      { error: 'validation', message: policy.message },
      { status: 400 },
    );
  }

  if (!displayName) {
    return NextResponse.json(
      { error: 'validation', message: 'Display name is required' },
      { status: 400 },
    );
  }

  const user = createAdminUser({
    email: row.email,
    displayName,
    password,
    active: true,
  });

  markInviteAccepted(row.id);

  try {
    await sendAdminWelcomeEmail({
      email: user.email,
      displayName: user.displayName,
    });
  } catch {
    // Account is created even if welcome email fails.
  }

  logAdminAuditEvent({
    action: 'admin_invite_accepted',
    meta: { inviteId: row.id, userId: user.id, email: user.email },
  });

  return NextResponse.json({ user });
}
