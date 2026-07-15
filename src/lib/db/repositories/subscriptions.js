import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import {
  ALL_ALERT_TYPES,
  createDefaultAlertPrefs,
  hasAnyAlertPrefEnabled,
  normalizeAlertPrefs,
} from '@/constants/alert-types';

export function createSubscription(payload) {
  const id = uuidv4();
  const now = new Date().toISOString();
  const unsubscribeToken = uuidv4();

  const alertPrefs =
    payload.alertPrefs && typeof payload.alertPrefs === 'object'
      ? normalizeAlertPrefs(payload.alertPrefs)
      : payload.type === 'city_alerts'
        ? createDefaultAlertPrefs({
            rain: Boolean(payload.alertOnRain),
            storm: Boolean(payload.alertOnStorm),
          })
        : {};

  const alertOnRain = Boolean(alertPrefs.rain ?? payload.alertOnRain);
  const alertOnStorm = Boolean(alertPrefs.thunderstorm ?? payload.alertOnStorm);

  getDb()
    .prepare(
      `INSERT INTO subscriptions (
        id, client_id, email, type, city_name, city_lat, city_lon, frequency,
        alert_on_rain, alert_on_storm, alert_prefs_json, active, unsubscribe_token, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
    )
    .run(
      id,
      payload.clientId,
      payload.email,
      payload.type,
      payload.cityName ?? null,
      payload.cityLat ?? null,
      payload.cityLon ?? null,
      payload.frequency ?? null,
      alertOnRain ? 1 : 0,
      alertOnStorm ? 1 : 0,
      JSON.stringify(alertPrefs),
      unsubscribeToken,
      now,
      now,
    );

  return getSubscriptionById(id);
}

export function getSubscriptionById(id) {
  const row = getDb().prepare('SELECT * FROM subscriptions WHERE id = ?').get(id);
  return row ? mapSubscription(row) : null;
}

export function getSubscriptionByToken(token) {
  const row = getDb()
    .prepare('SELECT * FROM subscriptions WHERE unsubscribe_token = ?')
    .get(token);
  return row ? mapSubscription(row) : null;
}

export function listActiveSubscriptionsByClientId(clientId) {
  const rows = getDb()
    .prepare('SELECT * FROM subscriptions WHERE active = 1 AND client_id = ?')
    .all(clientId);
  return rows.map(mapSubscription);
}

export function deactivateSubscriptionsByClientCity({ clientId, cityLat, cityLon, types }) {
  const placeholders = types.map(() => '?').join(', ');
  const rows = getDb()
    .prepare(
      `SELECT id FROM subscriptions
       WHERE active = 1 AND client_id = ? AND city_lat = ? AND city_lon = ? AND type IN (${placeholders})`,
    )
    .all(clientId, cityLat, cityLon, ...types);

  const now = new Date().toISOString();
  const stmt = getDb().prepare('UPDATE subscriptions SET active = 0, updated_at = ? WHERE id = ?');

  for (const row of rows) {
    stmt.run(now, row.id);
  }

  return rows.map((row) => row.id);
}

export function deactivateSubscription(token) {
  getDb()
    .prepare('UPDATE subscriptions SET active = 0, updated_at = ? WHERE unsubscribe_token = ?')
    .run(new Date().toISOString(), token);
}

export function listActiveSubscriptions(type = null) {
  const rows = type
    ? getDb().prepare('SELECT * FROM subscriptions WHERE active = 1 AND type = ?').all(type)
    : getDb().prepare('SELECT * FROM subscriptions WHERE active = 1').all();
  return rows.map(mapSubscription);
}

/**
 * Count active weekly digests for an email (case-insensitive).
 * @param {string} email
 * @returns {number}
 */
export function countActiveWeeklyDigestsByEmail(email) {
  const normalized = String(email ?? '').trim().toLowerCase();
  if (!normalized) {
    return 0;
  }

  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS total FROM subscriptions
       WHERE active = 1 AND type = 'city_weekly' AND LOWER(email) = ?`,
    )
    .get(normalized);

  return Number(row?.total ?? 0);
}

/**
 * Group active weekly digests by normalized email for batch sending.
 * @returns {Map<string, ReturnType<typeof mapSubscription>[]>}
 */
export function groupActiveWeeklyDigestsByEmail() {
  const subscriptions = listActiveSubscriptions('city_weekly');
  const groups = new Map();

  for (const sub of subscriptions) {
    const key = String(sub.email ?? '').trim().toLowerCase();
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(sub);
    groups.set(key, list);
  }

  return groups;
}

/**
 * @param {{ type?: string | null, active?: boolean | null, limit?: number, offset?: number }} [options]
 */
export function listSubscriptions(options = {}) {
  const { type = null, active = null, limit = 500, offset = 0 } = options;
  const clauses = [];
  const params = [];

  if (type) {
    clauses.push('type = ?');
    params.push(type);
  }

  if (active != null) {
    clauses.push('active = ?');
    params.push(active ? 1 : 0);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = getDb()
    .prepare(
      `SELECT * FROM subscriptions ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
    )
    .all(...params, limit, offset);

  return rows.map(mapSubscription);
}

/**
 * @param {{ type?: string | null, active?: boolean | null }} [options]
 */
export function countSubscriptions(options = {}) {
  const { type = null, active = null } = options;
  const clauses = [];
  const params = [];

  if (type) {
    clauses.push('type = ?');
    params.push(type);
  }

  if (active != null) {
    clauses.push('active = ?');
    params.push(active ? 1 : 0);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const row = getDb().prepare(`SELECT COUNT(*) AS total FROM subscriptions ${where}`).get(...params);
  return Number(row?.total ?? 0);
}

export function getSubscriptionSummary() {
  const rows = getDb()
    .prepare(
      `SELECT type, active, COUNT(*) AS total
       FROM subscriptions
       GROUP BY type, active`,
    )
    .all();

  const summary = {
    newsletterActive: 0,
    newsletterInactive: 0,
    weeklyActive: 0,
    alertsActive: 0,
    total: 0,
    alertTypeCounts: ALL_ALERT_TYPES.map((type) => ({
      id: type.id,
      label: type.label,
      shortLabel: type.shortLabel ?? type.label,
      count: 0,
    })),
  };

  for (const row of rows) {
    const total = Number(row.total ?? 0);
    summary.total += total;

    if (row.type === 'newsletter' && row.active) summary.newsletterActive += total;
    if (row.type === 'newsletter' && !row.active) summary.newsletterInactive += total;
    if (row.type === 'city_weekly' && row.active) summary.weeklyActive += total;
    if (row.type === 'city_alerts' && row.active) summary.alertsActive += total;
  }

  const alertRows = getDb()
    .prepare(
      `SELECT alert_prefs_json, alert_on_rain, alert_on_storm
       FROM subscriptions
       WHERE active = 1 AND type = 'city_alerts'`,
    )
    .all();

  const countsById = Object.fromEntries(
    summary.alertTypeCounts.map((entry) => [entry.id, entry]),
  );

  for (const row of alertRows) {
    const prefs = normalizeAlertPrefs(row.alert_prefs_json, {
      alertOnRain: Boolean(row.alert_on_rain),
      alertOnStorm: Boolean(row.alert_on_storm),
    });

    for (const type of ALL_ALERT_TYPES) {
      if (prefs[type.id]) {
        countsById[type.id].count += 1;
      }
    }
  }

  return summary;
}

/**
 * Merge alert preference updates. Deactivates when no alert types remain enabled.
 * @param {string} id
 * @param {Record<string, boolean>} partialPrefs
 */
export function updateSubscriptionAlertPrefs(id, partialPrefs) {
  const current = getSubscriptionById(id);
  if (!current || current.type !== 'city_alerts') {
    return null;
  }

  const nextPrefs = {
    ...current.alertPrefs,
    ...partialPrefs,
  };

  const now = new Date().toISOString();
  const alertOnRain = Boolean(nextPrefs.rain);
  const alertOnStorm = Boolean(nextPrefs.thunderstorm);

  if (!hasAnyAlertPrefEnabled(nextPrefs)) {
    getDb()
      .prepare(
        `UPDATE subscriptions
         SET alert_on_rain = 0,
             alert_on_storm = 0,
             alert_prefs_json = ?,
             active = 0,
             updated_at = ?
         WHERE id = ?`,
      )
      .run(JSON.stringify(nextPrefs), now, id);

    return { subscription: null, removed: true };
  }

  getDb()
    .prepare(
      `UPDATE subscriptions
       SET alert_on_rain = ?,
           alert_on_storm = ?,
           alert_prefs_json = ?,
           updated_at = ?
       WHERE id = ? AND active = 1`,
    )
    .run(alertOnRain ? 1 : 0, alertOnStorm ? 1 : 0, JSON.stringify(nextPrefs), now, id);

  return { subscription: getSubscriptionById(id), removed: false };
}

/**
 * Permanently remove subscriptions by id. Also clears related send-log rows.
 * @param {string[]} ids
 * @returns {number} deleted count
 */
export function deleteSubscriptionsByIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return 0;
  }

  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return 0;
  }

  const placeholders = uniqueIds.map(() => '?').join(', ');
  const database = getDb();
  const deleteLog = database.prepare(
    `DELETE FROM subscription_send_log WHERE subscription_id IN (${placeholders})`,
  );
  const deleteSubs = database.prepare(
    `DELETE FROM subscriptions WHERE id IN (${placeholders})`,
  );

  const run = database.transaction(() => {
    deleteLog.run(...uniqueIds);
    const result = deleteSubs.run(...uniqueIds);
    return result.changes;
  });

  return run();
}

export function logSubscriptionSend(entry) {
  getDb()
    .prepare(
      `INSERT INTO subscription_send_log (id, subscription_id, city_lat, city_lon, condition, sent_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      uuidv4(),
      entry.subscriptionId,
      entry.cityLat,
      entry.cityLon,
      entry.condition,
      new Date().toISOString(),
    );
}

export function getLastSendCondition(subscriptionId, alertTypeId = null) {
  if (alertTypeId) {
    const row = getDb()
      .prepare(
        `SELECT condition FROM subscription_send_log
         WHERE subscription_id = ? AND condition LIKE ?
         ORDER BY sent_at DESC LIMIT 1`,
      )
      .get(subscriptionId, `${alertTypeId}:%`);
    return row?.condition ?? null;
  }

  const row = getDb()
    .prepare(
      `SELECT condition FROM subscription_send_log
       WHERE subscription_id = ?
       ORDER BY sent_at DESC LIMIT 1`,
    )
    .get(subscriptionId);
  return row?.condition ?? null;
}

function mapSubscription(row) {
  const alertPrefs = normalizeAlertPrefs(row.alert_prefs_json, {
    alertOnRain: Boolean(row.alert_on_rain),
    alertOnStorm: Boolean(row.alert_on_storm),
  });

  return {
    id: row.id,
    clientId: row.client_id,
    email: row.email,
    type: row.type,
    cityName: row.city_name,
    cityLat: row.city_lat,
    cityLon: row.city_lon,
    frequency: row.frequency,
    alertPrefs,
    alertOnRain: Boolean(alertPrefs.rain),
    alertOnStorm: Boolean(alertPrefs.thunderstorm),
    active: Boolean(row.active),
    unsubscribeToken: row.unsubscribe_token,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
