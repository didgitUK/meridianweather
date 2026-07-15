import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getEncryptionKey() {
  const secret = process.env.ADMIN_SECRET?.trim() || '';

  if (!secret) {
    return null;
  }

  return crypto.createHash('sha256').update(secret).digest();
}

/** Encrypt a string for DB storage. Falls back to plaintext prefix if no admin secret. */
export function encryptSecret(plaintext) {
  if (!plaintext) {
    return '';
  }

  const key = getEncryptionKey();

  if (!key) {
    return `plain:${plaintext}`;
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `v1:${iv.toString('base64url')}:${tag.toString('base64url')}:${encrypted.toString('base64url')}`;
}

export function decryptSecret(stored) {
  if (!stored) {
    return '';
  }

  if (stored.startsWith('plain:')) {
    return stored.slice('plain:'.length);
  }

  if (!stored.startsWith('v1:')) {
    return stored;
  }

  const key = getEncryptionKey();

  if (!key) {
    throw new Error('Cannot decrypt AdSense token without ADMIN_SECRET');
  }

  const [, ivB64, tagB64, dataB64] = stored.split(':');
  const iv = Buffer.from(ivB64, 'base64url');
  const tag = Buffer.from(tagB64, 'base64url');
  const data = Buffer.from(dataB64, 'base64url');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}
