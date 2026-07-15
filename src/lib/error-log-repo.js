import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { logger, sanitizeLogMeta } from '@/lib/server/logger';

/**
 * Persist an error/warning for admin + filesystem audit.
 * @param {{
 *   level?: 'error'|'warn'|'info',
 *   source: string,
 *   message: string,
 *   stack?: string | null,
 *   correlationId?: string | null,
 *   meta?: Record<string, unknown>,
 *   writeFile?: boolean,
 * }} input
 */
export function logErrorEvent(input) {
  const level = input.level ?? 'error';
  const source = String(input.source ?? 'unknown');
  const message = String(input.message ?? 'Unexpected error');
  const stack = input.stack ? String(input.stack).slice(0, 8000) : null;
  const correlationId = input.correlationId ? String(input.correlationId) : null;
  const meta = sanitizeLogMeta(input.meta ?? {});
  const id = uuidv4();
  const timestamp = new Date().toISOString();

  try {
    getDb()
      .prepare(
        `INSERT INTO error_events (
           id, timestamp, level, source, message, stack, correlation_id, meta_json
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        timestamp,
        level,
        source,
        message.slice(0, 2000),
        stack,
        correlationId,
        JSON.stringify(meta ?? {}),
      );
  } catch (persistError) {
    logger.error('Failed to persist error_events row', {
      scope: 'error-log-repo',
      meta: { reason: persistError?.message },
    });
  }

  if (input.writeFile !== false) {
    logger[level === 'warn' ? 'warn' : level === 'info' ? 'info' : 'error'](message, {
      scope: source,
      correlationId: correlationId ?? undefined,
      meta: { ...meta, stack: stack ? 'present' : undefined, errorEventId: id },
    });
  }

  return id;
}

/**
 * @param {{ limit?: number, source?: string }} [options]
 */
export function listErrorEvents({ limit = 50, source } = {}) {
  const capped = Math.min(Math.max(Number(limit) || 50, 1), 200);

  if (source) {
    return getDb()
      .prepare(
        `SELECT id, timestamp, level, source, message, stack, correlation_id, meta_json
         FROM error_events
         WHERE source = ?
         ORDER BY timestamp DESC
         LIMIT ?`,
      )
      .all(source, capped)
      .map(mapErrorRow);
  }

  return getDb()
    .prepare(
      `SELECT id, timestamp, level, source, message, stack, correlation_id, meta_json
       FROM error_events
       ORDER BY timestamp DESC
       LIMIT ?`,
    )
    .all(capped)
    .map(mapErrorRow);
}

function mapErrorRow(row) {
  return {
    id: row.id,
    timestamp: row.timestamp,
    level: row.level,
    source: row.source,
    message: row.message,
    stack: row.stack,
    correlationId: row.correlation_id,
    meta: row.meta_json ? JSON.parse(row.meta_json) : {},
  };
}
