import { NextResponse } from 'next/server';
import {
  getAdminSessionFromRequest,
  isAdminLoginConfigured,
} from '@/lib/server/admin-auth';

export async function GET(request) {
  const session = getAdminSessionFromRequest(request);

  return NextResponse.json({
    authenticated: session.authenticated,
    configured: isAdminLoginConfigured(),
    user: session.user,
  });
}
