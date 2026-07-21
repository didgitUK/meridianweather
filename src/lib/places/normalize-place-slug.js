/**
 * Canonical place slug for routing and DB lookups.
 * Decodes URI encoding once, trims, lowercases, collapses whitespace to hyphens.
 * @param {string | null | undefined} raw
 * @returns {string}
 */
export function normalizePlaceSlug(raw) {
  let value = String(raw ?? '').trim();
  if (!value) {
    return '';
  }

  try {
    value = decodeURIComponent(value);
  } catch {
    // Keep raw when malformed percent-encoding is present.
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
