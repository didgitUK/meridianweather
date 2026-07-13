import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/server/password';

function mapAdminUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at,
  };
}

export function countAdminUsers() {
  const row = getDb().prepare('SELECT COUNT(*) AS count FROM admin_users').get();
  return row?.count ?? 0;
}

export function listAdminUsers() {
  return getDb()
    .prepare(
      `SELECT id, email, display_name, active, created_at, updated_at, last_login_at
       FROM admin_users
       ORDER BY created_at ASC`,
    )
    .all()
    .map(mapAdminUser);
}

export function getAdminUserById(id) {
  const row = getDb()
    .prepare(
      `SELECT id, email, display_name, password_hash, active, created_at, updated_at, last_login_at
       FROM admin_users
       WHERE id = ?`,
    )
    .get(id);

  return row ?? null;
}

export function getAdminUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return (
    getDb()
      .prepare(
        `SELECT id, email, display_name, password_hash, active, created_at, updated_at, last_login_at
         FROM admin_users
         WHERE email = ?`,
      )
      .get(normalized) ?? null
  );
}

export function createAdminUser({ email, displayName, password, active = true }) {
  const id = uuidv4();
  const now = new Date().toISOString();
  const normalizedEmail = email.trim().toLowerCase();

  getDb()
    .prepare(
      `INSERT INTO admin_users (
         id, email, display_name, password_hash, active, created_at, updated_at, last_login_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
    )
    .run(
      id,
      normalizedEmail,
      displayName.trim(),
      hashPassword(password),
      active ? 1 : 0,
      now,
      now,
    );

  return mapAdminUser(getAdminUserById(id));
}

export function updateAdminUser(id, { email, displayName, active }) {
  const existing = getAdminUserById(id);
  if (!existing) {
    return null;
  }

  const now = new Date().toISOString();
  const nextEmail = email !== undefined ? email.trim().toLowerCase() : existing.email;
  const nextName = displayName !== undefined ? displayName.trim() : existing.display_name;
  const nextActive = active !== undefined ? (active ? 1 : 0) : existing.active;

  getDb()
    .prepare(
      `UPDATE admin_users
       SET email = ?, display_name = ?, active = ?, updated_at = ?
       WHERE id = ?`,
    )
    .run(nextEmail, nextName, nextActive, now, id);

  return mapAdminUser(getAdminUserById(id));
}

export function updateAdminUserPassword(id, password) {
  const existing = getAdminUserById(id);
  if (!existing) {
    return false;
  }

  getDb()
    .prepare(
      `UPDATE admin_users
       SET password_hash = ?, updated_at = ?
       WHERE id = ?`,
    )
    .run(hashPassword(password), new Date().toISOString(), id);

  return true;
}

export function deleteAdminUser(id) {
  const result = getDb().prepare('DELETE FROM admin_users WHERE id = ?').run(id);
  return result.changes > 0;
}

export function authenticateAdminUser(email, password) {
  const row = getAdminUserByEmail(email);
  if (!row || !row.active) {
    return null;
  }

  if (!verifyPassword(password, row.password_hash)) {
    return null;
  }

  const now = new Date().toISOString();
  getDb()
    .prepare('UPDATE admin_users SET last_login_at = ?, updated_at = ? WHERE id = ?')
    .run(now, now, row.id);

  return mapAdminUser({ ...row, last_login_at: now, updated_at: now });
}

export function publicAdminUser(rowOrMapped) {
  if (!rowOrMapped) {
    return null;
  }

  if (rowOrMapped.displayName !== undefined) {
    return rowOrMapped;
  }

  return mapAdminUser(rowOrMapped);
}

function getRootAdminEnv() {
  const password = (process.env.ADMIN_PASSWORD ?? process.env.ADMIN_SECRET ?? '').trim();
  if (!password) {
    return null;
  }

  return {
    email: (process.env.ADMIN_EMAIL ?? 'admin@localhost').trim().toLowerCase(),
    displayName: (process.env.ADMIN_DISPLAY_NAME ?? 'Root').trim() || 'Root',
    password,
  };
}

/**
 * Ensures the root admin from ADMIN_EMAIL / ADMIN_PASSWORD always exists.
 * Env is the buried master account — created if missing, reactivated if disabled.
 * Does not re-hash on every call (scrypt is expensive); master unlock still accepts ADMIN_PASSWORD.
 */
export function bootstrapAdminUsersFromEnv() {
  const root = getRootAdminEnv();
  if (!root) {
    return null;
  }

  const existing = getAdminUserByEmail(root.email);
  if (existing) {
    if (!existing.active) {
      updateAdminUser(existing.id, { active: true });
    }
    return mapAdminUser(getAdminUserById(existing.id));
  }

  return createAdminUser({
    email: root.email,
    displayName: root.displayName,
    password: root.password,
    active: true,
  });
}
