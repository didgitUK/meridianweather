/**
 * @param {string} body
 * @param {{ maxAge?: number }} [options]
 */
export function llmsTextResponse(body, options = {}) {
  const maxAge = Number.isFinite(options.maxAge) ? options.maxAge : 3600;
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': `public, max-age=${maxAge}`,
    },
  });
}
