/**
 * Lightweight env checks at module load (server).
 * Misconfiguration surfaces early instead of mid-request.
 */

const WARNINGS = [];

function read(name) {
  return process.env[name]?.trim() ?? '';
}

function warn(message) {
  WARNINGS.push(message);
  if (process.env.NODE_ENV !== 'test') {
    console.warn(`[env] ${message}`);
  }
}

export function getEnvWarnings() {
  return [...WARNINGS];
}

export function assertServerEnv() {
  if (typeof window !== 'undefined') {
    return { ok: true, warnings: [] };
  }

  if (!read('OPENWEATHER_API_KEY')) {
    warn('OPENWEATHER_API_KEY is unset — weather and geocode routes will fail.');
  }

  if (!read('CRON_SECRET') && process.env.NODE_ENV === 'production') {
    warn('CRON_SECRET is unset in production — cron routes accept any caller.');
  }

  if (!read('ADMIN_PASSWORD') && !read('ADMIN_SECRET') && process.env.NODE_ENV === 'production') {
    warn('ADMIN_PASSWORD/ADMIN_SECRET unset in production — admin auth is weak.');
  }

  return { ok: true, warnings: getEnvWarnings() };
}

// Run once when imported from a server entry.
assertServerEnv();
