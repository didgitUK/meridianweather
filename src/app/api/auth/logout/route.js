import { NextResponse } from 'next/server';
import { logAdminAuditEvent } from '@/lib/admin-audit-repo';
import { ADMIN_SESSION_COOKIE } from '@/lib/server/admin-auth';

export async function POST() {
  logAdminAuditEvent({ action: 'admin_logout' });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
