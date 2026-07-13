import { NextResponse } from 'next/server';
import { logAdminAuditEvent } from '@/lib/admin-audit-repo';
import {
  getAdminUserById,
  updateAdminUser,
  updateAdminUserPassword,
} from '@/lib/admin-users-repo';
import { getAdminSessionFromRequest } from '@/lib/server/admin-auth';
import { verifyPassword } from '@/lib/server/password';

function requireSessionUser(request) {
  const session = getAdminSessionFromRequest(request);
  if (!session.authenticated || !session.user?.id || session.user.id === 'dev-admin') {
    return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }), session: null };
  }
  return { error: null, session };
}

export async function GET(request) {
  const session = getAdminSessionFromRequest(request);
  if (!session.authenticated) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ user: session.user });
}

export async function PATCH(request) {
  const { error, session } = requireSessionUser(request);
  if (error) {
    return error;
  }

  const body = await request.json();
  const updates = {};

  if (typeof body.displayName === 'string') {
    updates.displayName = body.displayName;
  }
  if (typeof body.email === 'string') {
    updates.email = body.email;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'validation', message: 'No profile fields to update' }, { status: 400 });
  }

  try {
    const user = updateAdminUser(session.user.id, updates);
    logAdminAuditEvent({
      action: 'admin_profile_updated',
      meta: { userId: session.user.id, fields: Object.keys(updates) },
    });
    return NextResponse.json({ user });
  } catch (updateError) {
    if (String(updateError.message).includes('UNIQUE')) {
      return NextResponse.json({ error: 'conflict', message: 'Email is already in use' }, { status: 409 });
    }
    throw updateError;
  }
}

export async function PUT(request) {
  const { error, session } = requireSessionUser(request);
  if (error) {
    return error;
  }

  const body = await request.json();
  const currentPassword = body.currentPassword?.trim() ?? '';
  const nextPassword = body.password?.trim() ?? '';

  if (!currentPassword || !nextPassword) {
    return NextResponse.json(
      { error: 'validation', message: 'Current and new password are required' },
      { status: 400 },
    );
  }

  if (nextPassword.length < 8) {
    return NextResponse.json(
      { error: 'validation', message: 'Password must be at least 8 characters' },
      { status: 400 },
    );
  }

  const row = getAdminUserById(session.user.id);
  if (!row || !verifyPassword(currentPassword, row.password_hash)) {
    return NextResponse.json({ error: 'unauthorized', message: 'Current password is incorrect' }, { status: 401 });
  }

  updateAdminUserPassword(session.user.id, nextPassword);
  logAdminAuditEvent({
    action: 'admin_password_changed',
    meta: { userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
