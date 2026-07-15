import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';

export const ADMIN_INVITE_TTL_MS = 72 * 60 * 60 * 1000;

function mapInvite(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    invitedBy: row.invited_by,
    expiresAt: row.expires_at,
    acceptedAt: row.accepted_at,
    createdAt: row.created_at,
  };
}

export function hashAuthToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

export function createAuthToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function listPendingAdminInvites() {
  const now = new Date().toISOString();
  return getDb()
    .prepare(
      `SELECT id, email, display_name, invited_by, expires_at, accepted_at, created_at
       FROM admin_invites
       WHERE accepted_at IS NULL AND expires_at > ?
       ORDER BY created_at DESC`,
    )
    .all(now)
    .map(mapInvite);
}

export function getPendingInviteByEmail(email) {
  const normalized = email.trim().toLowerCase();
  const now = new Date().toISOString();
  return mapInvite(
    getDb()
      .prepare(
        `SELECT id, email, display_name, invited_by, expires_at, accepted_at, created_at
         FROM admin_invites
         WHERE email = ? AND accepted_at IS NULL AND expires_at > ?
         ORDER BY created_at DESC
         LIMIT 1`,
      )
      .get(normalized, now),
  );
}

export function getInviteByToken(token) {
  const tokenHash = hashAuthToken(token);
  return (
    getDb()
      .prepare(
        `SELECT id, email, display_name, token_hash, invited_by, expires_at, accepted_at, created_at
         FROM admin_invites
         WHERE token_hash = ?`,
      )
      .get(tokenHash) ?? null
  );
}

export function createAdminInvite({ email, displayName, invitedBy = null, token }) {
  const id = uuidv4();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ADMIN_INVITE_TTL_MS).toISOString();
  const normalizedEmail = email.trim().toLowerCase();

  getDb()
    .prepare(
      `INSERT INTO admin_invites (
         id, email, display_name, token_hash, invited_by, expires_at, accepted_at, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?)`,
    )
    .run(
      id,
      normalizedEmail,
      displayName.trim(),
      hashAuthToken(token),
      invitedBy,
      expiresAt,
      now.toISOString(),
    );

  return {
    invite: mapInvite(
      getDb()
        .prepare(
          `SELECT id, email, display_name, invited_by, expires_at, accepted_at, created_at
           FROM admin_invites WHERE id = ?`,
        )
        .get(id),
    ),
    token,
    expiresAt,
  };
}

export function revokeAdminInvite(id) {
  const result = getDb()
    .prepare(
      `DELETE FROM admin_invites
       WHERE id = ? AND accepted_at IS NULL`,
    )
    .run(id);

  return result.changes > 0;
}

export function revokePendingInvitesForEmail(email) {
  const normalized = email.trim().toLowerCase();
  getDb()
    .prepare(
      `DELETE FROM admin_invites
       WHERE email = ? AND accepted_at IS NULL`,
    )
    .run(normalized);
}

export function markInviteAccepted(id) {
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `UPDATE admin_invites
       SET accepted_at = ?
       WHERE id = ?`,
    )
    .run(now, id);
}
