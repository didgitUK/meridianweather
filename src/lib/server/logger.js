import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const LEVELS = Object.freeze({
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
});

/**
 * @param {string | null | undefined} email
 */
export function redactEmail(email) {
  const value = String(email ?? '').trim();
  if (!value || !value.includes('@')) {
    return value || undefined;
  }

  const [local, domain] = value.split('@');
  const head = local.slice(0, 1) || '*';
  return `${head}***@${domain}`;
}

/**
 * Strip obvious secrets from meta before logging.
 * @param {unknown} meta
 */
export function sanitizeLogMeta(meta) {
  if (meta == null || typeof meta !== 'object') {
    return meta;
  }

  if (Array.isArray(meta)) {
    return meta.map((entry) => sanitizeLogMeta(entry));
  }

  const out = {};
  for (const [key, value] of Object.entries(meta)) {
    const lower = key.toLowerCase();
    if (
      lower.includes('password')
      || lower.includes('secret')
      || lower.includes('apikey')
      || lower.includes('api_key')
      || lower.includes('authorization')
      || lower.includes('cookie')
      || lower.includes('token')
    ) {
      out[key] = '[redacted]';
      continue;
    }

    if (lower.includes('email') && typeof value === 'string') {
      out[key] = redactEmail(value);
      continue;
    }

    out[key] = sanitizeLogMeta(value);
  }

  return out;
}

function resolveLogLevel() {
  const raw = String(process.env.LOG_LEVEL ?? 'info').toLowerCase();
  return LEVELS[raw] ?? LEVELS.info;
}

function shouldWriteFiles() {
  return process.env.LOG_TO_FILE !== '0';
}

function logsDir() {
  return path.join(/* turbopackIgnore: true */ process.cwd(), 'data', 'logs');
}

function dayStamp(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function appendJsonLine(fileName, record) {
  if (!shouldWriteFiles()) {
    return;
  }

  try {
    const dir = logsDir();
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, fileName), `${JSON.stringify(record)}\n`, 'utf8');
  } catch {
    // Disk may be read-only in some hosts — console still carries the line.
  }
}

/**
 * @param {'debug'|'info'|'warn'|'error'} level
 * @param {string} msg
 * @param {{ scope?: string, correlationId?: string, meta?: Record<string, unknown> }} [options]
 */
export function log(level, msg, options = {}) {
  const threshold = resolveLogLevel();
  const numeric = LEVELS[level] ?? LEVELS.info;
  if (numeric < threshold) {
    return;
  }

  const record = {
    ts: new Date().toISOString(),
    level,
    msg: String(msg ?? ''),
    scope: options.scope ?? 'app',
    correlationId: options.correlationId ?? undefined,
    meta: options.meta ? sanitizeLogMeta(options.meta) : undefined,
  };

  const line = JSON.stringify(record);
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }

  appendJsonLine(`app-${dayStamp()}.jsonl`, record);
  if (level === 'error') {
    appendJsonLine(`error-${dayStamp()}.jsonl`, record);
  }
}

export const logger = {
  debug: (msg, options) => log('debug', msg, options),
  info: (msg, options) => log('info', msg, options),
  warn: (msg, options) => log('warn', msg, options),
  error: (msg, options) => log('error', msg, options),
};

export function createCorrelationId() {
  return uuidv4().slice(0, 8);
}
