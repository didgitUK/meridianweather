/**
 * Browser-side JSON fetch with a consistent error message.
 * Throws Error with `status` and `code` when the response is not ok.
 */
const DEFAULT_TIMEOUT_MS = 15_000;

function networkErrorMessage(error) {
  if (error?.name === 'AbortError' || error?.name === 'TimeoutError') {
    return 'Request timed out — check your connection and try again.';
  }

  if (error instanceof TypeError || /failed to fetch/i.test(error?.message ?? '')) {
    return 'Network error — check your connection and try again.';
  }

  return error?.message ?? 'Network error — check your connection and try again.';
}

export async function fetchJson(url, options = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal, ...rest } = options;
  const controller = new AbortController();
  const timeoutId =
    timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  try {
    const response = await fetch(url, { ...rest, signal: controller.signal });
    let payload = null;

    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const message =
        payload?.message ??
        (typeof payload?.error === 'string' ? payload.error : null) ??
        `Request failed (${response.status})`;
      const error = new Error(message);
      error.status = response.status;
      error.code = payload?.error ?? 'request_failed';
      error.payload = payload;
      throw error;
    }

    return payload;
  } catch (error) {
    if (error?.status || error?.code === 'request_failed') {
      throw error;
    }

    const wrapped = new Error(networkErrorMessage(error));
    wrapped.code = 'network_error';
    wrapped.cause = error;
    throw wrapped;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
