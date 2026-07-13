import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  isAdminLoginConfigured,
  loginAdminUser,
} from '@/lib/server/admin-auth';

export async function POST(request) {
  if (!isAdminLoginConfigured()) {
    return NextResponse.json(
      {
        error: 'not_configured',
        message: 'Set ADMIN_PASSWORD (and optionally ADMIN_EMAIL) in the server environment.',
      },
      { status: 503 },
    );
  }

  const body = await request.json();
  const email = body.email?.trim() ?? '';
  const password = body.password?.trim() ?? '';

  const user = loginAdminUser({ email, password });
  if (!user) {
    return NextResponse.json({ error: 'unauthorized', message: 'Invalid credentials' }, { status: 401 });
  }

  const token = createAdminSessionToken(user);
  const response = NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    },
  });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, getAdminSessionCookieOptions());

  return response;
}
