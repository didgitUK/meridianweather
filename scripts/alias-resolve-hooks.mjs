import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = path.join(root, 'src');

function resolveFile(candidate) {
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate;
  }
  if (fs.existsSync(`${candidate}.js`)) {
    return `${candidate}.js`;
  }
  if (fs.existsSync(`${candidate}.mjs`)) {
    return `${candidate}.mjs`;
  }
  const indexJs = path.join(candidate, 'index.js');
  if (fs.existsSync(indexJs)) {
    return indexJs;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  let target = specifier;

  if (specifier.startsWith('@/')) {
    target = path.join(srcRoot, specifier.slice(2));
  } else if (specifier.startsWith('.') && context.parentURL) {
    const parentDir = path.dirname(fileURLToPath(context.parentURL));
    target = path.resolve(parentDir, specifier);
  } else {
    return nextResolve(specifier, context);
  }

  const resolved = resolveFile(target);
  if (!resolved) {
    return nextResolve(specifier, context);
  }

  return nextResolve(pathToFileURL(resolved).href, context);
}
