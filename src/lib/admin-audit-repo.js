import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';

export function logAdminAuditEvent({ action, meta = {} }) {
  getDb()
    .prepare(
      `INSERT INTO admin_audit_log (id, action, timestamp, meta_json)
       VALUES (?, ?, ?, ?)`,
    )
    .run(uuidv4(), action, new Date().toISOString(), JSON.stringify(meta));
}

export function getRecentAdminAuditEvents(action, limit = 10) {
  return getDb()
    .prepare(
      `SELECT id, action, timestamp, meta_json
       FROM admin_audit_log
       WHERE action = ?
       ORDER BY timestamp DESC
       LIMIT ?`,
    )
    .all(action, limit)
    .map((row) => ({
      id: row.id,
      action: row.action,
      timestamp: row.timestamp,
      meta: row.meta_json ? JSON.parse(row.meta_json) : {},
    }));
}
