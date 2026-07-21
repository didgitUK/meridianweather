import { NextResponse } from 'next/server';
import { purgeExpiredObservabilityData } from '@/lib/server/data-retention';
import { finishProcessRun, startProcessRun } from '@/lib/process-run-repo';
import { apiError } from '@/lib/server/api-response';
import { isCronRequestAuthorized } from '@/lib/server/cron-auth';

export const runtime = 'nodejs';

export async function GET(request) {
  if (!isCronRequestAuthorized(request)) {
    return apiError('unauthorized', 'Invalid cron credentials', 401);
  }

  const run = startProcessRun({ job: 'data-retention' });

  try {
    const result = purgeExpiredObservabilityData();
    finishProcessRun(run.id, {
      status: 'ok',
      counts: result.deleted,
      meta: { policy: result.policy },
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    finishProcessRun(run.id, {
      status: 'error',
      errorSummary: error?.message ?? 'purge failed',
    });
    return apiError('purge_failed', error?.message ?? 'Unable to purge data', 500);
  }
}
