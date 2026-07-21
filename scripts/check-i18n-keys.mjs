#!/usr/bin/env node
/**
 * Fail when non-default locale message files miss keys present in en.json.
 */
import fs from 'fs';
import path from 'path';

const messagesDir = path.resolve(process.cwd(), 'messages');
const en = JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8'));

function flatten(obj, prefix = '', out = new Set()) {
  if (obj == null || typeof obj !== 'object' || Array.isArray(obj)) {
    out.add(prefix);
    return out;
  }
  for (const [key, value] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      flatten(value, next, out);
    } else {
      out.add(next);
    }
  }
  return out;
}

const enKeys = flatten(en);
let failed = false;

for (const file of fs.readdirSync(messagesDir).filter((name) => name.endsWith('.json') && name !== 'en.json')) {
  const data = JSON.parse(fs.readFileSync(path.join(messagesDir, file), 'utf8'));
  const keys = flatten(data);
  const missing = [...enKeys].filter((key) => !keys.has(key)).sort();
  if (missing.length > 0) {
    failed = true;
    console.error(`\n${file} missing ${missing.length} keys:`);
    for (const key of missing.slice(0, 40)) {
      console.error(`  - ${key}`);
    }
    if (missing.length > 40) {
      console.error(`  …and ${missing.length - 40} more`);
    }
  } else {
    console.log(`${file}: ok (${keys.size} keys)`);
  }
}

if (failed) {
  process.exit(1);
}

console.log('i18n key parity: all locales cover en.json keys');
