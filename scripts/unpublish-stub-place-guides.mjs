#!/usr/bin/env node
/**
 * Unpublish stub / filler place guides (AdSense low-value remediation).
 *
 * Usage:
 *   node --import ./scripts/alias-loader.mjs scripts/unpublish-stub-place-guides.mjs
 *   node --import ./scripts/alias-loader.mjs scripts/unpublish-stub-place-guides.mjs --all
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

try {
  const envPath = path.join(root, '.env.local');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const eq = trimmed.indexOf('=');
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"'))
        || (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
} catch {
  // ignore
}

if (!process.env.DATABASE_PATH) {
  process.env.DATABASE_PATH = path.join(root, 'data', 'meridian.db');
}

const unpublishAll = process.argv.includes('--all');

async function main() {
  const {
    unpublishStubPlaceGuides,
    unpublishAllPlaceGuides,
    listPublishedPlaceArticlePaths,
  } = await import('@/lib/places/place-articles-repo.js');

  const before = listPublishedPlaceArticlePaths().length;
  const result = unpublishAll
    ? unpublishAllPlaceGuides()
    : unpublishStubPlaceGuides();
  const after = listPublishedPlaceArticlePaths().length;

  console.log(
    JSON.stringify(
      {
        mode: unpublishAll ? 'all' : 'stub-signatures',
        beforePublished: before,
        afterPublished: after,
        ...result,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
