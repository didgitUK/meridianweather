import crypto from 'crypto';
import { cookies } from 'next/headers';
import {
  authenticateAdminUser,
  bootstrapAdminUsersFromEnv,
  countAdminUsers,
  getAdminUserById,
  publicAdminUser,
  updateAdminUserPassword,
} from '@/lib/admin-users-repo';
import { verifyPassword } from '@/lib/server/password';

export const ADMIN_SESSION_COOKIE = 'meridian_admin_session';
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/** HMAC / AES key material — never reuse ADMIN_PASSWORD for this. */
function getSigningSecret() {
  return (process.env.ADMIN_SECRET ?? '').trim();
}

function getRootPassword() {
  return (process.env.ADMIN_PASSWORD ?? '').trim();
}

export function ensureAdminAuthReady() {
  bootstrapAdminUsersFromEnv();
}

export function isAdminLoginConfigured() {
  ensureAdminAuthReady();
  return Boolean(getSigningSecret()) && (countAdminUsers() > 0 || Boolean(getRootPassword()));
}

/** Env root unlock only — ADMIN_PASSWORD, not ADMIN_SECRET. */
export function verifyAdminPassword(password) {
  const secret = getRootPassword();
  if (!secret || !password) {
    return false;
  }

  const expected = Buffer.from(secret);
  const received = Buffer.from(password);

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
}

export function createAdminSessionToken(user) {
  const secret = getSigningSecret();
  if (!secret) {
    throw new Error('Admin login is not configured');
  }

  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = Buffer.from(
    JSON.stringify({
      sub: user?.id ?? null,
      email: user?.email ?? null,
      name: user?.displayName ?? null,
      sv: user?.sessionVersion ?? 0,
      exp: expiresAt,
    }),
  ).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');

  return `${payload}.${signature}`;
}

export function parseAdminSessionToken(token) {
  const secret = getSigningSecret();
  if (!secret || !token) {
    return null;
  }

  const [payload, signature] = token.split('.');
  if (!payload || !signature) {
    return null;
  }

  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const received = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (received.length !== expectedBuffer.length || !crypto.timingSafeEqual(received, expectedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof parsed.exp !== 'number' || parsed.exp <= Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function verifyAdminSessionToken(token) {
  return Boolean(parseAdminSessionToken(token));
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

function isDevBypassEnabled() {
  return (
    process.env.NODE_ENV === 'development' &&
    process.env.ALLOW_DEV_ADMIN_BYPASS === '1' &&
    !getSigningSecret()
  );
}

function sessionFromParsed(parsed) {
  // Reject legacy null-sub sessions — they skip session_version invalidation.
  if (!parsed.sub) {
    return { authenticated: false, user: null };
  }

  const row = getAdminUserById(parsed.sub);
  if (!row || !row.active) {
    return { authenticated: false, user: null };
  }
  const user = publicAdminUser(row);
  const tokenSv = typeof parsed.sv === 'number' ? parsed.sv : 0;
  const userSv = typeof user.sessionVersion === 'number' ? user.sessionVersion : 0;
  if (tokenSv !== userSv) {
    return { authenticated: false, user: null };
  }
  return { authenticated: true, user };
}

const DEV_ADMIN_USER = {
  id: 'dev-admin',
  email: 'admin@localhost',
  displayName: 'Dev Admin',
  active: true,
  createdAt: null,
  updatedAt: null,
  lastLoginAt: null,
  sessionVersion: 0,
};

export function getAdminSessionFromRequest(request) {
  ensureAdminAuthReady();

  if (isDevBypassEnabled()) {
    return { authenticated: true, user: DEV_ADMIN_USER };
  }

  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const parsed = parseAdminSessionToken(cookieValue);
  if (!parsed) {
    return { authenticated: false, user: null };
  }

  return sessionFromParsed(parsed);
}

export async function getAdminSession() {
  ensureAdminAuthReady();

  if (isDevBypassEnabled()) {
    return { authenticated: true, user: DEV_ADMIN_USER };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const parsed = parseAdminSessionToken(token);
  if (!parsed) {
    return { authenticated: false, user: null };
  }

  return sessionFromParsed(parsed);
}

export function isAdminRequestAuthorized(request) {
  return getAdminSessionFromRequest(request).authenticated;
}

export async function isAdminSessionActive() {
  const session = await getAdminSession();
  return session.authenticated;
}

/**
 * Authenticate by email+password against admin_users.
 * ADMIN_PASSWORD unlocks only ADMIN_EMAIL (root bootstrap), never arbitrary admins.
 */
export function loginAdminUser({ email, password }) {
  ensureAdminAuthReady();

  const trimmedEmail = email?.trim().toLowerCase() ?? '';
  const trimmedPassword = password?.trim() ?? '';

  if (!trimmedPassword) {
    return null;
  }

  if (trimmedEmail) {
    const user = authenticateAdminUser(trimmedEmail, trimmedPassword);
    if (user) {
      return user;
    }
  }

  if (!verifyAdminPassword(trimmedPassword)) {
    return null;
  }

  const rootEmail = (process.env.ADMIN_EMAIL ?? 'admin@localhost').trim().toLowerCase();
  if (trimmedEmail && trimmedEmail !== rootEmail) {
    return null;
  }

  const root = bootstrapAdminUsersFromEnv();
  if (!root) {
    return null;
  }

  const row = getAdminUserById(root.id);
  if (!row) {
    return null;
  }

  if (!verifyPassword(trimmedPassword, row.password_hash)) {
    updateAdminUserPassword(root.id, trimmedPassword);
  }

  return publicAdminUser(getAdminUserById(root.id));
}
