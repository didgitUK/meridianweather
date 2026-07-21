import { getDb } from '@/lib/db';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Default retention windows (days). Override with RETENTION_*_DAYS env vars.
 */
export function getRetentionPolicy() {
  return {
    analyticsDays: Number(process.env.RETENTION_ANALYTICS_DAYS) || 90,
    errorEventsDays: Number(process.env.RETENTION_ERROR_EVENTS_DAYS) || 90,
    processRunsDays: Number(process.env.RETENTION_PROCESS_RUNS_DAYS) || 90,
    emailSendLogDays: Number(process.env.RETENTION_EMAIL_SEND_LOG_DAYS) || 90,
    adminAuditDays: Number(process.env.RETENTION_ADMIN_AUDIT_DAYS) || 180,
  };
}

/**
 * Purge aged observability / analytics rows.
 * @returns {{ deleted: Record<string, number>, policy: ReturnType<typeof getRetentionPolicy> }}
 */
export function purgeExpiredObservabilityData(now = Date.now()) {
  const policy = getRetentionPolicy();
  const db = getDb();
  const deleted = {};

  /** @type {Array<{ table: string, column: string, days: number }>} */
  const targets = [
    { table: 'site_analytics_events', column: 'created_at', days: policy.analyticsDays },
    { table: 'error_events', column: 'timestamp', days: policy.errorEventsDays },
    { table: 'process_runs', column: 'started_at', days: policy.processRunsDays },
    { table: 'email_send_log', column: 'timestamp', days: policy.emailSendLogDays },
    { table: 'admin_audit_log', column: 'timestamp', days: policy.adminAuditDays },
  ];

  for (const target of targets) {
    const cutoffIso = new Date(now - target.days * DAY_MS).toISOString();
    try {
      const result = db
        .prepare(`DELETE FROM ${target.table} WHERE ${target.column} < ?`)
        .run(cutoffIso);
      deleted[target.table] = Number(result.changes ?? 0);
    } catch {
      deleted[target.table] = 0;
    }
  }

  return { deleted, policy };
}
