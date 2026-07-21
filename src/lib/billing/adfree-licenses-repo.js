import { getDb } from '@/lib/db';

function mapRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    plan: row.plan,
    status: row.status,
    stripeCustomerId: row.stripe_customer_id ?? null,
    stripeSubscriptionId: row.stripe_subscription_id ?? null,
    stripeSessionId: row.stripe_session_id ?? null,
    expiresAt: row.expires_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function findAdFreeLicenseByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const row = getDb()
    .prepare('SELECT * FROM adfree_licenses WHERE email = ?')
    .get(normalized);

  return mapRow(row);
}

export function findAdFreeLicenseBySessionId(sessionId) {
  if (!sessionId) {
    return null;
  }

  const row = getDb()
    .prepare('SELECT * FROM adfree_licenses WHERE stripe_session_id = ?')
    .get(sessionId);

  return mapRow(row);
}

export function upsertAdFreeLicense({
  email,
  plan,
  status = 'active',
  stripeCustomerId = null,
  stripeSubscriptionId = null,
  stripeSessionId = null,
  expiresAt = null,
}) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized || !plan) {
    return null;
  }

  const now = new Date().toISOString();
  const existing = findAdFreeLicenseByEmail(normalized);
  const id = existing?.id ?? normalized;

  getDb()
    .prepare(
      `INSERT INTO adfree_licenses (
         id, email, plan, status, stripe_customer_id, stripe_subscription_id,
         stripe_session_id, expires_at, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET
         plan = excluded.plan,
         status = excluded.status,
         stripe_customer_id = COALESCE(excluded.stripe_customer_id, adfree_licenses.stripe_customer_id),
         stripe_subscription_id = COALESCE(excluded.stripe_subscription_id, adfree_licenses.stripe_subscription_id),
         stripe_session_id = COALESCE(excluded.stripe_session_id, adfree_licenses.stripe_session_id),
         expires_at = excluded.expires_at,
         updated_at = excluded.updated_at`,
    )
    .run(
      id,
      normalized,
      plan,
      status,
      stripeCustomerId,
      stripeSubscriptionId,
      stripeSessionId,
      expiresAt,
      existing?.createdAt ?? now,
      now,
    );

  return findAdFreeLicenseByEmail(normalized);
}

export function setAdFreeLicenseStatus(email, status, { expiresAt = undefined } = {}) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const now = new Date().toISOString();
  if (expiresAt !== undefined) {
    getDb()
      .prepare(
        `UPDATE adfree_licenses
         SET status = ?, expires_at = ?, updated_at = ?
         WHERE email = ?`,
      )
      .run(status, expiresAt, now, normalized);
  } else {
    getDb()
      .prepare(
        `UPDATE adfree_licenses
         SET status = ?, updated_at = ?
         WHERE email = ?`,
      )
      .run(status, now, normalized);
  }

  return findAdFreeLicenseByEmail(normalized);
}
