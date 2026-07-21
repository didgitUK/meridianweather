import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';
import { normalizePwaNotifyMode, PWA_NOTIFY_MODES } from '@/constants/pwa';

function mapRow(row) {
  if (!row) {
    return null;
  }

  let cities = [];
  try {
    cities = JSON.parse(row.cities_json || '[]');
  } catch {
    cities = [];
  }

  return {
    id: row.id,
    endpoint: row.endpoint,
    p256dh: row.p256dh,
    auth: row.auth,
    clientId: row.client_id,
    cities: Array.isArray(cities) ? cities : [],
    notifyMode: normalizePwaNotifyMode(row.notify_mode),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastNotifiedAt: row.last_notified_at,
  };
}

export function upsertPushSubscription({
  endpoint,
  p256dh,
  auth,
  clientId = null,
  cities = [],
  notifyMode = PWA_NOTIFY_MODES.daily,
}) {
  if (!endpoint || !p256dh || !auth) {
    throw new Error('Push subscription requires endpoint and keys');
  }

  const db = getDb();
  const now = new Date().toISOString();
  const citiesJson = JSON.stringify(cities ?? []);
  const mode = normalizePwaNotifyMode(notifyMode);
  const existing = db.prepare('SELECT id FROM push_subscriptions WHERE endpoint = ?').get(endpoint);

  if (existing) {
    db.prepare(
      `UPDATE push_subscriptions
       SET p256dh = ?, auth = ?, client_id = ?, cities_json = ?, notify_mode = ?, updated_at = ?
       WHERE endpoint = ?`,
    ).run(p256dh, auth, clientId, citiesJson, mode, now, endpoint);
    return mapRow(
      db.prepare('SELECT * FROM push_subscriptions WHERE endpoint = ?').get(endpoint),
    );
  }

  const id = randomUUID();
  db.prepare(
    `INSERT INTO push_subscriptions (
       id, endpoint, p256dh, auth, client_id, cities_json, notify_mode, created_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(id, endpoint, p256dh, auth, clientId, citiesJson, mode, now, now);

  return mapRow(db.prepare('SELECT * FROM push_subscriptions WHERE id = ?').get(id));
}

export function deletePushSubscriptionByEndpoint(endpoint) {
  if (!endpoint) {
    return false;
  }
  const result = getDb().prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').run(endpoint);
  return result.changes > 0;
}

export function listPushSubscriptions() {
  return getDb()
    .prepare('SELECT * FROM push_subscriptions ORDER BY updated_at DESC')
    .all()
    .map(mapRow);
}

export function touchPushSubscriptionNotified(id) {
  getDb()
    .prepare('UPDATE push_subscriptions SET last_notified_at = ? WHERE id = ?')
    .run(new Date().toISOString(), id);
}
