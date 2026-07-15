/**
 * Coalesce concurrent identical async work (client-side).
 * Separate callers await the same Promise until it settles.
 *
 * @template T
 * @param {string} key
 * @param {() => Promise<T>} factory
 * @returns {Promise<T>}
 */
const inflight = new Map();

export function singleFlight(key, factory) {
  const existing = inflight.get(key);
  if (existing) {
    return existing;
  }

  const promise = Promise.resolve()
    .then(factory)
    .finally(() => {
      if (inflight.get(key) === promise) {
        inflight.delete(key);
      }
    });

  inflight.set(key, promise);
  return promise;
}

/**
 * @param {string} key
 */
export function clearSingleFlight(key) {
  inflight.delete(key);
}
