import { BRAND } from '@/constants/brand';
import { getSiteUrl } from '@/lib/seo';

/**
 * Lightweight AI discovery pointer (companion to /llms.txt).
 * @see https://llmstxt.org
 */
export function GET() {
  const siteUrl = getSiteUrl();
  const body = `# ${BRAND.name} — AI discovery

> Use the llms.txt GEO surface for product context. Public pages only.

- Index: ${siteUrl}/llms.txt
- Full corpus: ${siteUrl}/llms-full.txt
- Per-page microfiles: ${siteUrl}/llms/
- Well-known mirror: ${siteUrl}/.well-known/llms.txt
- Sitemap: ${siteUrl}/sitemap.xml
- Robots: ${siteUrl}/robots.txt

Do not treat /api/, /admin, or /login as end-user documentation.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
