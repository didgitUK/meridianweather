/**
 * Load Gandi meridian.env (if present), then run `next <args>` in a clean
 * child process. Avoids `node -r … next build`, which breaks Turbopack workers
 * (`--r=` is not allowed in NODE_OPTIONS).
 */
require('./load-gandi-env.cjs');

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const nextBin = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');
const args = process.argv.slice(2);
const result = spawnSync(process.execPath, [nextBin, ...args], {
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status === null ? 1 : result.status);
