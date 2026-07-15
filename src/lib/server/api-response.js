import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/api-client';
import { logErrorEvent } from '@/lib/error-log-repo';
import { createCorrelationId } from '@/lib/server/logger';

/**
 * Canonical API error envelope: `{ error, message }`.
 * Prefer named codes: invalid_request | rate_limited | unauthorized | upstream_error | not_found | location_not_found | service_unavailable
 */
export function apiError(error, message, status = 400) {
  return NextResponse.json({ error, message }, { status });
}

export function statusFromCaughtError(error, { invalidPrefix = 'Invalid' } = {}) {
  if (error instanceof ApiError) {
    return {
      error: error.code ?? 'upstream_error',
      message: error.message ?? 'Unexpected error',
      status: error.status ?? 502,
    };
  }

  if (error && typeof error === 'object' && error.code && error.status) {
    return {
      error: error.code,
      message: error.message ?? 'Unexpected error',
      status: error.status,
    };
  }

  const message = error?.message ?? 'Unexpected error';

  if (message.includes('paused') || message.includes('rate')) {
    return { error: 'rate_limited', message, status: 429 };
  }

  if (
    message.startsWith(invalidPrefix)
    || message.includes('required')
    || message.includes('at least')
  ) {
    return { error: 'invalid_request', message, status: 400 };
  }

  return { error: 'upstream_error', message, status: 502 };
}

/**
 * @param {unknown} error
 * @param {{ source?: string, correlationId?: string, meta?: Record<string, unknown>, persist?: boolean } & Record<string, unknown>} [overrides]
 */
export function apiErrorFromCaught(error, overrides = {}) {
  const {
    source = 'api',
    correlationId,
    meta,
    persist = true,
    ...statusOverrides
  } = overrides;

  const resolved = { ...statusFromCaughtError(error), ...statusOverrides };
  const corr = correlationId ?? createCorrelationId();

  if (persist && resolved.status >= 500) {
    logErrorEvent({
      level: 'error',
      source,
      message: resolved.message,
      stack: error instanceof Error ? error.stack : null,
      correlationId: corr,
      meta: {
        ...meta,
        errorCode: resolved.error,
        status: resolved.status,
      },
    });
  }

  return apiError(resolved.error, resolved.message, resolved.status);
}
