/**
 * Load persistent production env from Gandi data volume when present.
 * Path survives git deploy; upload via scripts/gandi-upload-env.sh
 */
const fs = require('node:fs');

const home = process.env.HOME || '';
const CANDIDATES = [
  process.env.MERIDIAN_ENV_FILE,
  '/srv/data/home/meridian.env',
  home ? `${home}/meridian.env` : null,
  '/lamp0/home/meridian.env',
].filter(Boolean);

for (const filePath of CANDIDATES) {
  try {
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      const eq = trimmed.indexOf('=');
      if (eq <= 0) {
        continue;
      }
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1);
      if (
        (value.startsWith('"') && value.endsWith('"'))
        || (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] == null || process.env[key] === '') {
        process.env[key] = value;
      }
    }
    break;
  } catch {
    // Ignore missing / unreadable env files.
  }
}
