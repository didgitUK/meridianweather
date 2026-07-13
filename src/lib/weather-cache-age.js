export function resolveScopeMaxAgeMs(maxAgeMs, scope) {
  if (maxAgeMs == null) {
    return null;
  }

  if (typeof maxAgeMs === 'number') {
    return maxAgeMs;
  }

  return maxAgeMs[scope] ?? null;
}

export function getSnapshotAgeMs(fetchedAt) {
  if (!fetchedAt) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(0, Date.now() - Date.parse(fetchedAt));
}

export function cacheMeetsMaxAge(cached, maxAgeMs) {
  if (!maxAgeMs) {
    return true;
  }

  if (!cached) {
    return false;
  }

  const fetchedAt = cached.meta?.fetchedAt ?? cached.emergency?.fetchedAt ?? null;

  return getSnapshotAgeMs(fetchedAt) <= maxAgeMs;
}
