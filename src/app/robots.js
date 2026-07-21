import { getSiteUrl } from '@/lib/seo';

/** Paths that must stay out of search / agent indexes. */
const DISALLOW = ['/api/', '/admin', '/login', '/forgot-password', '/invite/', '/reset-password/'];

/**
 * Public crawl policy: Google + AI agents are welcome on product pages.
 * Only auth, admin, and API surfaces are disallowed.
 */
export default function robots() {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: DISALLOW,
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: DISALLOW,
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: DISALLOW,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: DISALLOW,
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: DISALLOW,
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: DISALLOW,
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: DISALLOW,
      },
      {
        userAgent: 'Applebot',
        allow: '/',
        disallow: DISALLOW,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: DISALLOW,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl.replace(/^https?:\/\//, ''),
  };
}
