import { v4 as uuidv4 } from 'uuid';
import { getPlatformSettings } from '@/lib/platform-settings';
import {
  getDailyUsageCounts,
  getRecentApiCalls,
  getUsageBreakdown,
  logApiCall,
} from '@/lib/weather-snapshot-repo';

const minuteWindow = [];
let lastResetDate = new Date().toISOString().slice(0, 10);

function resetIfNeeded() {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== lastResetDate) {
    minuteWindow.length = 0;
    lastResetDate = today;
  }
}

function pruneMinuteWindow() {
  const cutoff = Date.now() - 60_000;
  while (minuteWindow.length && minuteWindow[0] < cutoff) {
    minuteWindow.shift();
  }
}

export function recordCacheHit(endpoint, meta = {}) {
  resetIfNeeded();
  // Memory hits fire on every SSR/client remount. Persisting them to SQLite makes
  // meridian.db churn under NextCloud / file watchers and feels like constant reloads.
  if (meta?.layer === 'memory') {
    return;
  }

  logApiCall({
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    endpoint,
    cacheHit: true,
    status: 'cache_hit',
    durationMs: 0,
    meta,
  });
}

export function canMakeUpstreamCall() {
  resetIfNeeded();
  pruneMinuteWindow();
  const settings = getPlatformSettings();
  const { upstream: used } = getDailyUsageCounts();

  if (used >= settings.dailyLimit) return false;
  if (used >= settings.softBlockThreshold) return false;
  if (minuteWindow.length >= settings.perMinuteLimit) return false;

  return true;
}

export async function trackUpstreamCall(endpoint, fn, meta = {}) {
  resetIfNeeded();
  pruneMinuteWindow();

  if (!canMakeUpstreamCall()) {
    logApiCall({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      endpoint,
      cacheHit: false,
      status: 'blocked',
      durationMs: 0,
      meta,
    });
    return { blocked: true, result: null };
  }

  const started = Date.now();

  try {
    const result = await fn();
    minuteWindow.push(Date.now());

    logApiCall({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      endpoint,
      cacheHit: false,
      status: '200',
      durationMs: result.durationMs ?? Date.now() - started,
      meta,
    });

    return { blocked: false, result };
  } catch (error) {
    logApiCall({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      endpoint,
      cacheHit: false,
      status: String(error?.status ?? 'error'),
      durationMs: Date.now() - started,
      meta: {
        ...meta,
        failure: true,
        message: error?.message ?? 'Upstream call failed',
      },
    });
    throw error;
  }
}

export function getUsageSnapshot() {
  resetIfNeeded();
  const settings = getPlatformSettings();
  const counts = getDailyUsageCounts();
  const used = counts.upstream;
  const remaining = Math.max(settings.dailyLimit - used, 0);
  const percentUsed = Number(((used / settings.dailyLimit) * 100).toFixed(1));

  let status = 'ok';
  if (used >= settings.dailyLimit) status = 'hard_block';
  else if (used >= settings.softBlockThreshold) status = 'soft_block';
  else if (used >= settings.warningThreshold) status = 'warning';

  const resetsAt = new Date();
  resetsAt.setUTCHours(24, 0, 0, 0);

  return {
    dailyLimit: settings.dailyLimit,
    used,
    remaining,
    percentUsed,
    status,
    warningThreshold: settings.warningThreshold,
    softBlockThreshold: settings.softBlockThreshold,
    perMinuteLimit: settings.perMinuteLimit,
    resetsAt: resetsAt.toISOString(),
    refreshIntervalMs: settings.refreshIntervalMs,
    breakdown: {
      ...getUsageBreakdown(),
      blocked: counts.blocked,
      cacheHits: counts.cacheHits,
    },
    recentCalls: getRecentApiCalls(50),
    sourceUpdatesEvery: '10min',
  };
}

export function __resetUsageTrackerForTests() {
  minuteWindow.length = 0;
  lastResetDate = new Date().toISOString().slice(0, 10);
}
