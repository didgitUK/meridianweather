#!/usr/bin/env node
/**
 * Reset English CMS docs + legal pages to file defaults so HTML matches GEO.
 * Usage (host or local):
 *   DATABASE_PATH=/path/to/meridian.db node --import ./scripts/alias-loader.mjs scripts/reset-cms-public-content.mjs
 */
import { CMS_COLLECTION } from '../src/constants/cms.js';
import { resetCmsCollection } from '../src/lib/cms/cms-page-repo.js';

const docs = resetCmsCollection(CMS_COLLECTION.DOCS);
const legal = resetCmsCollection(CMS_COLLECTION.LEGAL);

console.log(
  JSON.stringify(
    {
      ok: true,
      docs,
      legal,
    },
    null,
    2,
  ),
);
