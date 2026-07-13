/**
 * Escape HTML for safe injection into email templates.
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Replace `{{variable}}` tokens. Unknown tokens are left unchanged.
 * Values are HTML-escaped unless the key ends with `Html`.
 * @param {string} template
 * @param {Record<string, unknown>} vars
 * @returns {string}
 */
export function interpolateTemplate(template, vars = {}) {
  return String(template ?? '').replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    if (!(key in vars)) {
      return match;
    }

    const value = vars[key];
    if (key.endsWith('Html')) {
      return String(value ?? '');
    }

    return escapeHtml(value);
  });
}

/**
 * @param {{ subject: string, html: string }} template
 * @param {Record<string, unknown>} vars
 * @returns {{ subject: string, html: string }}
 */
export function renderEmailTemplateContent(template, vars = {}) {
  return {
    subject: interpolateTemplate(template.subject, vars),
    html: interpolateTemplate(template.html, vars),
  };
}
