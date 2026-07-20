#!/usr/bin/env node
/**
 * Prefetch hero images for UK weather places.
 * Uses Vite to resolve @/ aliases the same way Vitest does.
 *
 * Usage: npm run prefetch:place-heroes -- --limit=25
 */
import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

async function main() {
  const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : 25;

  const server = await createServer({
    root,
    server: { middlewareMode: true },
    appType: 'custom',
    resolve: {
      alias: {
        '@': path.join(root, 'src'),
      },
    },
  });

  try {
    const { seedUkPlacesPhaseA, countUkPlaces, listUkPlaces } = await server.ssrLoadModule(
      '/src/lib/places/uk-places-repo.js',
    );
    const { getHeroImageForRegion } = await server.ssrLoadModule(
      '/src/lib/hero-image/get-hero-image-for-region.js',
    );

    if (countUkPlaces() === 0) {
      seedUkPlacesPhaseA();
    }

    const places = listUkPlaces({ limit });
    let ok = 0;
    let fail = 0;

    for (const place of places) {
      try {
        const image = await getHeroImageForRegion({
          city: place.name,
          state: place.adminArea,
          country: place.country,
          lat: place.lat,
          lon: place.lon,
        });
        if (image) {
          ok += 1;
          console.log(`ok ${place.slug}`);
        } else {
          fail += 1;
          console.log(`empty ${place.slug}`);
        }
      } catch (error) {
        fail += 1;
        console.log(`fail ${place.slug}: ${error.message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    console.log(`Hero prefetch done: ok=${ok} fail=${fail} total=${places.length}`);
  } finally {
    await server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
