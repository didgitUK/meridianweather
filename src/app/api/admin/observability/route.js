import { NextResponse } from 'next/server';
import { getRecentAdminAuditEvents } from '@/lib/admin-audit-repo';
import { listEmailSends } from '@/lib/email-send-log-repo';
import { listErrorEvents } from '@/lib/error-log-repo';
import { listProcessRuns } from '@/lib/process-run-repo';
import { isAdminRequestAuthorized } from '@/lib/server/admin-auth';
import { getDb } from '@/lib/db';

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

function listRecentAdminAudit(limit = 40) {
  return getDb()
    .prepare(
      `SELECT id, action, timestamp, meta_json
       FROM admin_audit_log
       ORDER BY timestamp DESC
       LIMIT ?`,
    )
    .all(limit)
    .map((row) => ({
      id: row.id,
      action: row.action,
      timestamp: row.timestamp,
      meta: row.meta_json ? JSON.parse(row.meta_json) : {},
    }));
}

export async function GET(request) {
  if (!isAdminRequestAuthorized(request)) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit') ?? 50);

  return NextResponse.json({
    errors: listErrorEvents({ limit }),
    processRuns: listProcessRuns({ limit }),
    emailSends: listEmailSends({ limit }),
    adminAudit: listRecentAdminAudit(Math.min(limit, 80)),
    // Keep helper import exercised for action-specific scrapes if needed later
    loginFailures: getRecentAdminAuditEvents('admin_login_failed', 10),
  });
}
