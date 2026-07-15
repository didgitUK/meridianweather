/**
 * Best-effort POST of client errors to /api/client-errors.
 * @param {{ message?: string, stack?: string, digest?: string, path?: string }} payload
 */
export function reportClientError(payload = {}) {
  if (typeof window === 'undefined' || typeof fetch !== 'function') {
    return;
  }

  const body = JSON.stringify({
    message: payload.message ?? 'Client error',
    stack: payload.stack,
    digest: payload.digest,
    path: payload.path ?? window.location?.pathname,
  });

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/client-errors', blob);
      return;
    }
  } catch {
    // fall through to fetch
  }

  fetch('/api/client-errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
}
