import { createHmac, timingSafeEqual } from 'node:crypto';
import { ADFEEE_PLAN_IDS } from '@/constants/billing';

function getLicenseSecret() {
  return process.env.ADFEEE_LICENSE_SECRET || process.env.ADMIN_SECRET || '';
}

function toBase64Url(value) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function fromBase64Url(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signPayload(encodedPayload, secret) {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

/**
 * @param {{
 *   email: string,
 *   plan: string,
 *   status?: string,
 *   expiresAt?: string | null,
 *   stripeCustomerId?: string | null,
 * }} input
 */
export function createAdFreeLicenseToken(input) {
  const secret = getLicenseSecret();
  if (!secret) {
    throw new Error('ADFEEE_LICENSE_SECRET is not configured');
  }

  const plan = String(input.plan || '');
  if (!ADFEEE_PLAN_IDS.includes(plan)) {
    throw new Error('Invalid ad-free plan');
  }

  const payload = {
    v: 1,
    email: String(input.email || '').trim().toLowerCase(),
    plan,
    status: input.status || 'active',
    expiresAt: input.expiresAt ?? null,
    stripeCustomerId: input.stripeCustomerId ?? null,
    iat: Math.floor(Date.now() / 1000),
  };

  const encoded = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(encoded, secret);
  return `${encoded}.${signature}`;
}

/**
 * @param {string | null | undefined} token
 * @returns {null | {
 *   email: string,
 *   plan: string,
 *   status: string,
 *   expiresAt: string | null,
 *   stripeCustomerId: string | null,
 *   iat: number,
 *   isAdFree: boolean,
 * }}
 */
export function verifyAdFreeLicenseToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }

  const secret = getLicenseSecret();
  if (!secret) {
    return null;
  }

  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) {
    return null;
  }

  const expected = signPayload(encoded, secret);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(fromBase64Url(encoded));
  } catch {
    return null;
  }

  if (!payload?.email || !ADFEEE_PLAN_IDS.includes(payload.plan)) {
    return null;
  }

  if (payload.status && payload.status !== 'active') {
    return null;
  }

  if (payload.expiresAt) {
    const expiresMs = Date.parse(payload.expiresAt);
    if (Number.isFinite(expiresMs) && expiresMs < Date.now()) {
      return null;
    }
  }

  return {
    email: payload.email,
    plan: payload.plan,
    status: payload.status || 'active',
    expiresAt: payload.expiresAt ?? null,
    stripeCustomerId: payload.stripeCustomerId ?? null,
    iat: payload.iat ?? 0,
    isAdFree: true,
  };
}

export function createRestoreToken(email) {
  const secret = getLicenseSecret();
  if (!secret) {
    throw new Error('ADFEEE_LICENSE_SECRET is not configured');
  }

  const payload = {
    v: 1,
    purpose: 'restore',
    email: String(email || '').trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + 30 * 60,
  };
  const encoded = toBase64Url(JSON.stringify(payload));
  return `${encoded}.${signPayload(encoded, secret)}`;
}

export function verifyRestoreToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }

  const secret = getLicenseSecret();
  if (!secret) {
    return null;
  }

  const [encoded, signature] = token.split('.');
  const expected = signPayload(encoded, secret);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(fromBase64Url(encoded));
  } catch {
    return null;
  }

  if (payload?.purpose !== 'restore' || !payload.email) {
    return null;
  }
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return { email: payload.email };
}
