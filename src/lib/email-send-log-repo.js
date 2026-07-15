import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { redactEmail, sanitizeLogMeta } from '@/lib/server/logger';

/**
 * @param {{
 *   provider: string,
 *   templateSlug?: string | null,
 *   to: string,
 *   status: 'sent'|'failed'|'skipped',
 *   reason?: string | null,
 *   correlationId?: string | null,
 *   meta?: Record<string, unknown>,
 * }} input
 */
export function logEmailSend(input) {
  const id = uuidv4();
  const timestamp = new Date().toISOString();
  const recipientFingerprint = redactEmail(input.to) ?? 'unknown';

  getDb()
    .prepare(
      `INSERT INTO email_send_log (
         id, timestamp, provider, template_slug, recipient_fingerprint, status, reason, correlation_id, meta_json
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      timestamp,
      String(input.provider ?? 'unknown'),
      input.templateSlug ? String(input.templateSlug) : null,
      recipientFingerprint,
      String(input.status ?? 'failed'),
      input.reason ? String(input.reason).slice(0, 1000) : null,
      input.correlationId ? String(input.correlationId) : null,
      JSON.stringify(sanitizeLogMeta(input.meta ?? {})),
    );

  return id;
}

/**
 * @param {{ limit?: number }} [options]
 */
export function listEmailSends({ limit = 50 } = {}) {
  const capped = Math.min(Math.max(Number(limit) || 50, 1), 200);

  return getDb()
    .prepare(
      `SELECT id, timestamp, provider, template_slug, recipient_fingerprint, status, reason, correlation_id, meta_json
       FROM email_send_log
       ORDER BY timestamp DESC
       LIMIT ?`,
    )
    .all(capped)
    .map((row) => ({
      id: row.id,
      timestamp: row.timestamp,
      provider: row.provider,
      templateSlug: row.template_slug,
      recipientFingerprint: row.recipient_fingerprint,
      status: row.status,
      reason: row.reason,
      correlationId: row.correlation_id,
      meta: row.meta_json ? JSON.parse(row.meta_json) : {},
    }));
}
