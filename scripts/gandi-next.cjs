/**
 * Load Gandi meridian.env (if present), then run `next <args>` in a clean
 * child process. Avoids `node -r … next build`, which breaks Turbopack workers
 * (`--r=` is not allowed in NODE_OPTIONS).
 */
require('./load-gandi-env.cjs');

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const nextBin = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');
const args = process.argv.slice(2);

// Prerender must not open the live volume DB (WAL / concurrent writes → SQLITE_CORRUPT).
// Keep NEXT_PUBLIC_* from meridian.env; use an isolated sqlite file for build only.
if (args[0] === 'build') {
  const buildDb = process.env.MERIDIAN_BUILD_DATABASE_PATH
    || path.join(os.tmpdir(), 'meridian-build.db');
  process.env.DATABASE_PATH = buildDb;
  try {
    fs.rmSync(buildDb, { force: true });
    fs.rmSync(`${buildDb}-wal`, { force: true });
    fs.rmSync(`${buildDb}-shm`, { force: true });
  } catch {
    // ignore
  }
}

const result = spawnSync(process.execPath, [nextBin, ...args], {
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status === null ? 1 : result.status);
