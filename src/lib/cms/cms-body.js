/**
 * CMS / blog body helpers: plain text ↔ TipTap HTML, allowlisted sanitize for public render.
 */

const ALLOWED_TAGS = new Set([
  'p',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'strong',
  'em',
  'b',
  'i',
  'a',
  'br',
]);

/**
 * @param {string | null | undefined} value
 */
export function looksLikeHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(String(value ?? '').trim());
}

/**
 * Convert plain `\n\n` paragraphs (or a body string array) into TipTap-friendly HTML.
 * @param {string | string[] | null | undefined} value
 */
export function plainTextToHtml(value) {
  if (Array.isArray(value)) {
    return value
      .map((part) => String(part ?? '').trim())
      .filter(Boolean)
      .map((part) => `<p>${escapeHtml(part)}</p>`)
      .join('');
  }

  const text = String(value ?? '').trim();
  if (!text) {
    return '<p></p>';
  }

  if (looksLikeHtml(text)) {
    return text;
  }

  return text
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `<p>${escapeHtml(part)}</p>`)
    .join('');
}

/**
 * Ensure editor content is HTML (legacy plain text is upgraded in memory only).
 * @param {string | null | undefined} value
 */
export function normalizeCmsBodyToHtml(value) {
  return plainTextToHtml(value);
}

/**
 * @param {string} value
 */
export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Strip disallowed tags/attrs. Keeps href on anchors (http/https/mailto/# only).
 * @param {string | null | undefined} html
 */
export function sanitizeCmsHtml(html) {
  const input = String(html ?? '').trim();
  if (!input) {
    return '';
  }

  return input
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, rawTag, rawAttrs) => {
      const tag = String(rawTag).toLowerCase();
      const isClose = match.startsWith('</');

      if (!ALLOWED_TAGS.has(tag)) {
        return '';
      }

      if (isClose) {
        return `</${tag}>`;
      }

      if (tag === 'br') {
        return '<br />';
      }

      if (tag === 'a') {
        const hrefMatch = String(rawAttrs).match(/\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
        const href = hrefMatch?.[2] ?? hrefMatch?.[3] ?? hrefMatch?.[4] ?? '';
        if (!isSafeHref(href)) {
          return '<a>';
        }
        return `<a href="${escapeHtml(href)}">`;
      }

      return `<${tag}>`;
    })
    .replace(/<!--[\s\S]*?-->/g, '');
}

/**
 * @param {string} href
 */
function isSafeHref(href) {
  const value = String(href ?? '').trim();
  if (!value) {
    return false;
  }

  if (value.startsWith('#') || value.startsWith('/')) {
    return true;
  }

  return /^(https?:|mailto:)/i.test(value);
}

/**
 * Paragraph strings from HTML or plain text (for APIs that still expose `body[]`).
 * @param {string | null | undefined} htmlOrText
 */
export function paragraphsFromCmsBody(htmlOrText) {
  const value = String(htmlOrText ?? '').trim();
  if (!value) {
    return [];
  }

  if (!looksLikeHtml(value)) {
    return value
      .split(/\n\n+/)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  return value
    .replace(/<\/(p|h2|h3|li)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .split(/\n+/)
    .map((part) => decodeBasicEntities(part.trim()))
    .filter(Boolean);
}

/**
 * @param {string} value
 */
function decodeBasicEntities(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}
