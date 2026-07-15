import { NextResponse } from 'next/server';
import { logAdminAuditEvent } from '@/lib/admin-audit-repo';
import {
  countAdminUsers,
  deleteAdminUser,
  getAdminUserById,
  listAdminUsers,
  updateAdminUser,
  updateAdminUserPassword,
} from '@/lib/admin-users-repo';
import { getAdminSessionFromRequest } from '@/lib/server/admin-auth';
import { validatePasswordPolicy } from '@/lib/server/password';

function requireAdmin(request) {
  const session = getAdminSessionFromRequest(request);
  if (!session.authenticated) {
    return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }), session: null };
  }
  return { error: null, session };
}

export async function GET(request) {
  const { error } = requireAdmin(request);
  if (error) {
    return error;
  }

  return NextResponse.json({ users: listAdminUsers() });
}

export async function POST() {
  return NextResponse.json(
    {
      error: 'deprecated',
      message: 'Create admins by sending an invite from Account → Users.',
    },
    { status: 405 },
  );
}

export async function PATCH(request) {
  const { error, session } = requireAdmin(request);
  if (error) {
    return error;
  }

  const body = await request.json();
  const userId = body.id?.trim() ?? '';
  if (!userId) {
    return NextResponse.json({ error: 'validation', message: 'User id is required' }, { status: 400 });
  }

  const existing = getAdminUserById(userId);
  if (!existing) {
    return NextResponse.json({ error: 'not_found', message: 'Admin user not found' }, { status: 404 });
  }

  if (body.active === false && existing.active) {
    const activeCount = listAdminUsers().filter((user) => user.active).length;
    if (activeCount <= 1) {
      return NextResponse.json(
        { error: 'validation', message: 'At least one active admin is required' },
        { status: 400 },
      );
    }
  }

  try {
    const user = updateAdminUser(userId, {
      email: typeof body.email === 'string' ? body.email : undefined,
      displayName: typeof body.displayName === 'string' ? body.displayName : undefined,
      active: typeof body.active === 'boolean' ? body.active : undefined,
    });

    if (typeof body.password === 'string' && body.password.trim()) {
      const policy = validatePasswordPolicy(body.password.trim());
      if (!policy.ok) {
        return NextResponse.json(
          { error: 'validation', message: policy.message },
          { status: 400 },
        );
      }
      updateAdminUserPassword(userId, body.password.trim());
    }

    logAdminAuditEvent({
      action: 'admin_user_updated',
      meta: { actorId: session.user?.id ?? null, userId },
    });

    return NextResponse.json({ user });
  } catch (updateError) {
    if (String(updateError.message).includes('UNIQUE')) {
      return NextResponse.json({ error: 'conflict', message: 'Email is already in use' }, { status: 409 });
    }
    throw updateError;
  }
}

export async function DELETE(request) {
  const { error, session } = requireAdmin(request);
  if (error) {
    return error;
  }

  const body = await request.json();
  const userId = body.id?.trim() ?? '';
  if (!userId) {
    return NextResponse.json({ error: 'validation', message: 'User id is required' }, { status: 400 });
  }

  if (session.user?.id === userId) {
    return NextResponse.json(
      { error: 'validation', message: 'You cannot delete your own account' },
      { status: 400 },
    );
  }

  if (countAdminUsers() <= 1) {
    return NextResponse.json(
      { error: 'validation', message: 'At least one admin user is required' },
      { status: 400 },
    );
  }

  const deleted = deleteAdminUser(userId);
  if (!deleted) {
    return NextResponse.json({ error: 'not_found', message: 'Admin user not found' }, { status: 404 });
  }

  logAdminAuditEvent({
    action: 'admin_user_deleted',
    meta: { actorId: session.user?.id ?? null, userId },
  });

  return NextResponse.json({ ok: true });
}
