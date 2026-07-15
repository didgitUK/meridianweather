import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('error-log-repo', () => {
  let dbPath;
  let logErrorEvent;
  let listErrorEvents;

  beforeEach(async () => {
    dbPath = path.join(os.tmpdir(), `meridian-errors-${Date.now()}-${Math.random()}.db`);
    process.env.DATABASE_PATH = dbPath;
    process.env.LOG_TO_FILE = '0';
    vi.resetModules();
    ({ logErrorEvent, listErrorEvents } = await import('@/lib/error-log-repo'));
  });

  afterEach(() => {
    for (const suffix of ['', '-wal', '-shm']) {
      try {
        fs.unlinkSync(`${dbPath}${suffix}`);
      } catch {
        // ignore
      }
    }
  });

  it('persists and lists error events', () => {
    const id = logErrorEvent({
      source: 'test',
      message: 'Boom',
      correlationId: 'abc12345',
      meta: { email: 'test@example.com' },
      writeFile: false,
    });

    expect(id).toBeTruthy();
    const rows = listErrorEvents({ limit: 10 });
    expect(rows[0].message).toBe('Boom');
    expect(rows[0].source).toBe('test');
    expect(rows[0].meta.email).toBe('t***@example.com');
  });
});
