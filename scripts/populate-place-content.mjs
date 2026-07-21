#!/usr/bin/env node
/**
 * Populate place POIs + stub guides for hot UK places (no OpenAI key required).
 *
 * Usage:
 *   PLACE_CONTENT_LLM_MODE=stub node --import ./scripts/alias-loader.mjs scripts/populate-place-content.mjs
 *   PLACE_CONTENT_LLM_MODE=stub node --import ./scripts/alias-loader.mjs scripts/populate-place-content.mjs --limit=15
 *   PLACE_CONTENT_LLM_MODE=stub node --import ./scripts/alias-loader.mjs scripts/populate-place-content.mjs --slugs=blackpool,manchester
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

process.env.PLACE_CONTENT_LLM_MODE = process.env.PLACE_CONTENT_LLM_MODE || 'stub';
if (!process.env.DATABASE_PATH) {
  process.env.DATABASE_PATH = path.join(root, 'data', 'meridian.db');
}

function parseArgs(argv) {
  let limit = 12;
  let slugs = null;
  for (const arg of argv) {
    if (arg.startsWith('--limit=')) {
      limit = Math.max(1, Number(arg.slice('--limit='.length)) || 12);
    }
    if (arg.startsWith('--slugs=')) {
      slugs = arg
        .slice('--slugs='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return { limit, slugs };
}

async function main() {
  const { limit, slugs } = parseArgs(process.argv.slice(2));

  const { seedAllUkPlaces, countUkPlaces, listHotUkPlacesForRefresh, findUkPlaceBySlug } =
    await import('@/lib/places/uk-places-repo.js');
  const { runPlaceContentPipeline } =
    await import('@/lib/places/place-content-pipeline.js');
  const { getPlaceContentBudgetSnapshot } =
    await import('@/lib/places/place-content-budget.js');

  if (countUkPlaces() < 100) {
    console.log('Seeding UK places…');
    seedAllUkPlaces();
  }

  let places;
  if (slugs?.length) {
    places = slugs.map((slug) => findUkPlaceBySlug(slug)).filter(Boolean);
    const missing = slugs.filter((slug) => !findUkPlaceBySlug(slug));
    if (missing.length) {
      console.warn('Missing slugs (skipped):', missing.join(', '));
    }
  } else {
    places = listHotUkPlacesForRefresh(limit);
  }

  console.log(
    `Mode=${process.env.PLACE_CONTENT_LLM_MODE} places=${places.length}`,
    getPlaceContentBudgetSnapshot(),
  );

  let ok = 0;
  let failed = 0;
  let skipped = 0;

  for (const place of places) {
    process.stdout.write(`→ ${place.slug} … `);
    try {
      const result = await runPlaceContentPipeline({
        place: {
          slug: place.slug,
          name: place.name,
          lat: place.lat,
          lon: place.lon,
          adminArea: place.adminArea,
          country: place.country,
          population: place.population,
          placeType: place.placeType,
        },
        force: true,
      });

      if (result.skipped) {
        skipped += 1;
        console.log(`skipped (${result.reason})`);
      } else if (result.ok) {
        ok += 1;
        console.log(
          `ok status=${result.article?.status} pois=${result.pois?.pois?.length ?? 0} words=${result.article?.wordCount}`,
        );
      } else {
        failed += 1;
        console.log(`failed (${result.reason})`);
      }
    } catch (error) {
      failed += 1;
      console.log(`error ${error.message}`);
    }
  }

  console.log({ ok, failed, skipped, budget: getPlaceContentBudgetSnapshot() });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
