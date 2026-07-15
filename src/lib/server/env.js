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
    warn('CRON_SECRET is unset in production — cron routes deny all callers.');
  }

  if (!read('ADMIN_SECRET') && process.env.NODE_ENV === 'production') {
    warn('ADMIN_SECRET is unset in production — admin sessions cannot be signed.');
  }

  if (!read('ADMIN_PASSWORD') && process.env.NODE_ENV === 'production') {
    warn('ADMIN_PASSWORD is unset — env root admin bootstrap is disabled.');
  }

  return { ok: true, warnings: getEnvWarnings() };
}

// Run once when imported from a server entry.
assertServerEnv();
