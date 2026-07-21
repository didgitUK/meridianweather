import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = path.join(root, 'src');

register('./alias-resolve-hooks.mjs', pathToFileURL(path.join(root, 'scripts/')));

// Keep a no-op default so --import succeeds.
export {};
