import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { createAuthToken, hashAuthToken } from '@/lib/admin-invites-repo';

export const ADMIN_PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

export function createAdminPasswordReset({ userId, token = createAuthToken() }) {
  const id = uuidv4();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ADMIN_PASSWORD_RESET_TTL_MS).toISOString();

  getDb()
    .prepare(
      `DELETE FROM admin_password_resets
       WHERE user_id = ? AND used_at IS NULL`,
    )
    .run(userId);

  getDb()
    .prepare(
      `INSERT INTO admin_password_resets (
         id, user_id, token_hash, expires_at, used_at, created_at
       ) VALUES (?, ?, ?, ?, NULL, ?)`,
    )
    .run(id, userId, hashAuthToken(token), expiresAt, now.toISOString());

  return { id, token, expiresAt, userId };
}

export function getPasswordResetByToken(token) {
  const tokenHash = hashAuthToken(token);
  return (
    getDb()
      .prepare(
        `SELECT id, user_id, token_hash, expires_at, used_at, created_at
         FROM admin_password_resets
         WHERE token_hash = ?`,
      )
      .get(tokenHash) ?? null
  );
}

export function markPasswordResetUsed(id) {
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `UPDATE admin_password_resets
       SET used_at = ?
       WHERE id = ?`,
    )
    .run(now, id);
}

/** Atomically claim an unused, unexpired reset. Returns false if already used/expired. */
export function markPasswordResetUsedIfValid(id) {
  const now = new Date().toISOString();
  const result = getDb()
    .prepare(
      `UPDATE admin_password_resets
       SET used_at = ?
       WHERE id = ?
         AND used_at IS NULL
         AND expires_at > ?`,
    )
    .run(now, id, now);

  return result.changes > 0;
}

export { createAuthToken };
