import { NextResponse } from 'next/server';
import { logAdminAuditEvent } from '@/lib/admin-audit-repo';
import {
  createAdminInvite,
  createAuthToken,
  listPendingAdminInvites,
  revokeAdminInvite,
  revokePendingInvitesForEmail,
} from '@/lib/admin-invites-repo';
import { getAdminUserByEmail } from '@/lib/admin-users-repo';
import { sendAdminInviteEmail } from '@/lib/email';
import { getAdminSessionFromRequest } from '@/lib/server/admin-auth';

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

function requireAdmin(request) {
  const session = getAdminSessionFromRequest(request);
  if (!session.authenticated) {
    return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }), session: null };
  }
  return { error: null, session };
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

export async function GET(request) {
  const { error } = requireAdmin(request);
  if (error) {
    return error;
  }

  return NextResponse.json({ invites: listPendingAdminInvites() });
}

export async function POST(request) {
  const { error, session } = requireAdmin(request);
  if (error) {
    return error;
  }

  const body = await request.json();
  const email = body.email?.trim() ?? '';
  const displayName = body.displayName?.trim() ?? '';

  if (!email || !displayName) {
    return NextResponse.json(
      { error: 'validation', message: 'Email and display name are required' },
      { status: 400 },
    );
  }

  if (getAdminUserByEmail(email)) {
    return NextResponse.json(
      { error: 'conflict', message: 'An admin with this email already exists' },
      { status: 409 },
    );
  }

  revokePendingInvitesForEmail(email);

  const token = createAuthToken();
  const { invite, expiresAt } = createAdminInvite({
    email,
    displayName,
    invitedBy: session.user?.id ?? null,
    token,
  });

  const inviteUrl = `${getAppUrl()}/invite/${token}`;
  const invitedByName = session.user?.displayName || session.user?.email || 'An administrator';

  try {
    await sendAdminInviteEmail({
      email: invite.email,
      displayName: invite.displayName,
      invitedBy: invitedByName,
      inviteUrl,
      expiresAt: formatExpiresAt(expiresAt),
    });
  } catch (sendError) {
    revokeAdminInvite(invite.id);
    return NextResponse.json(
      {
        error: 'email_failed',
        message: sendError.message ?? 'Invite created but email failed to send. Check email connectors.',
      },
      { status: 502 },
    );
  }

  logAdminAuditEvent({
    action: 'admin_invite_sent',
    meta: { actorId: session.user?.id ?? null, inviteId: invite.id, email: invite.email },
  });

  return NextResponse.json({ invite }, { status: 201 });
}

export async function DELETE(request) {
  const { error, session } = requireAdmin(request);
  if (error) {
    return error;
  }

  const body = await request.json();
  const inviteId = body.id?.trim() ?? '';
  if (!inviteId) {
    return NextResponse.json({ error: 'validation', message: 'Invite id is required' }, { status: 400 });
  }

  const revoked = revokeAdminInvite(inviteId);
  if (!revoked) {
    return NextResponse.json({ error: 'not_found', message: 'Invite not found' }, { status: 404 });
  }

  logAdminAuditEvent({
    action: 'admin_invite_revoked',
    meta: { actorId: session.user?.id ?? null, inviteId },
  });

  return NextResponse.json({ ok: true });
}
