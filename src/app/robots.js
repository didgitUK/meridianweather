import { getSiteUrl } from '@/lib/seo';

export default function robots() {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/docs', '/legal', '/city/'],
        disallow: ['/api/', '/admin', '/login'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
