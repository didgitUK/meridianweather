import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { createCorrelationId, logger } from '@/lib/server/logger';

/**
 * @param {{ job: string, correlationId?: string, meta?: Record<string, unknown> }} input
 */
export function startProcessRun({ job, correlationId, meta = {} }) {
  const id = uuidv4();
  const startedAt = new Date().toISOString();
  const corr = correlationId ?? createCorrelationId();

  getDb()
    .prepare(
      `INSERT INTO process_runs (
         id, job, status, started_at, finished_at, correlation_id, counts_json, error_summary, meta_json
       ) VALUES (?, ?, 'running', ?, NULL, ?, '{}', NULL, ?)`,
    )
    .run(id, job, startedAt, corr, JSON.stringify(meta));

  logger.info(`Process started: ${job}`, {
    scope: 'process-run',
    correlationId: corr,
    meta: { processRunId: id, job },
  });

  return { id, correlationId: corr, startedAt };
}

/**
 * @param {string} id
 * @param {{ status?: 'ok'|'error'|'partial', counts?: Record<string, unknown>, errorSummary?: string | null, meta?: Record<string, unknown> }} result
 */
export function finishProcessRun(id, result = {}) {
  const finishedAt = new Date().toISOString();
  const status = result.status ?? 'ok';
  const counts = result.counts ?? {};
  const errorSummary = result.errorSummary ? String(result.errorSummary).slice(0, 2000) : null;

  getDb()
    .prepare(
      `UPDATE process_runs
       SET status = ?, finished_at = ?, counts_json = ?, error_summary = ?,
           meta_json = COALESCE(?, meta_json)
       WHERE id = ?`,
    )
    .run(
      status,
      finishedAt,
      JSON.stringify(counts),
      errorSummary,
      result.meta ? JSON.stringify(result.meta) : null,
      id,
    );

  const row = getProcessRun(id);
  logger.info(`Process finished: ${row?.job ?? id}`, {
    scope: 'process-run',
    correlationId: row?.correlationId,
    meta: { processRunId: id, status, counts, errorSummary },
  });

  return row;
}

export function getProcessRun(id) {
  const row = getDb()
    .prepare(
      `SELECT id, job, status, started_at, finished_at, correlation_id, counts_json, error_summary, meta_json
       FROM process_runs WHERE id = ?`,
    )
    .get(id);

  return row ? mapProcessRow(row) : null;
}

/**
 * @param {{ limit?: number, job?: string }} [options]
 */
export function listProcessRuns({ limit = 50, job } = {}) {
  const capped = Math.min(Math.max(Number(limit) || 50, 1), 200);

  if (job) {
    return getDb()
      .prepare(
        `SELECT id, job, status, started_at, finished_at, correlation_id, counts_json, error_summary, meta_json
         FROM process_runs
         WHERE job = ?
         ORDER BY started_at DESC
         LIMIT ?`,
      )
      .all(job, capped)
      .map(mapProcessRow);
  }

  return getDb()
    .prepare(
      `SELECT id, job, status, started_at, finished_at, correlation_id, counts_json, error_summary, meta_json
       FROM process_runs
       ORDER BY started_at DESC
       LIMIT ?`,
    )
    .all(capped)
    .map(mapProcessRow);
}

function mapProcessRow(row) {
  return {
    id: row.id,
    job: row.job,
    status: row.status,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    correlationId: row.correlation_id,
    counts: row.counts_json ? JSON.parse(row.counts_json) : {},
    errorSummary: row.error_summary,
    meta: row.meta_json ? JSON.parse(row.meta_json) : {},
  };
}
