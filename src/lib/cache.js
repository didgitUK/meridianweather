const memoryCache = new Map();

export function getMemoryCache(key) {
  return memoryCache.get(key) ?? null;
}

export function setMemoryCache(key, value) {
  memoryCache.set(key, value);
}

export function clearMemoryCache() {
  memoryCache.clear();
}

export function createCacheKey(parts) {
  return parts.filter(Boolean).join(':');
}
