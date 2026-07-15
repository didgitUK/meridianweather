import crypto from 'crypto';

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEYLEN = 64;

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

/**
 * @param {string} password
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function validatePasswordPolicy(password) {
  if (!password || typeof password !== 'string') {
    return { ok: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` };
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return { ok: false, message: `Password must be at most ${MAX_PASSWORD_LENGTH} characters` };
  }

  return { ok: true };
}

export function hashPassword(password) {
  const policy = validatePasswordPolicy(password);
  if (!policy.ok) {
    throw new Error(policy.message);
  }

  const salt = crypto.randomBytes(16).toString('base64url');
  const derived = crypto
    .scryptSync(password, salt, KEYLEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P })
    .toString('base64url');

  return `scrypt:${SCRYPT_N}:${SCRYPT_R}:${SCRYPT_P}:${salt}:${derived}`;
}

export function verifyPassword(password, stored) {
  if (!password || !stored) {
    return false;
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return false;
  }

  const parts = stored.split(':');
  if (parts.length !== 6 || parts[0] !== 'scrypt') {
    return false;
  }

  const [, nRaw, rRaw, pRaw, salt, expected] = parts;
  const n = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);

  if (!Number.isFinite(n) || !Number.isFinite(r) || !Number.isFinite(p) || !salt || !expected) {
    return false;
  }

  const derived = crypto
    .scryptSync(password, salt, KEYLEN, { N: n, r, p })
    .toString('base64url');

  const expectedBuffer = Buffer.from(expected);
  const derivedBuffer = Buffer.from(derived);

  if (expectedBuffer.length !== derivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, derivedBuffer);
}
