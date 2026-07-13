import { getSiteUrl } from '@/lib/seo';
import { getLocalizedSitemapEntries } from '@/lib/sitemap-routes';

export default function sitemap() {
  const siteUrl = getSiteUrl();

  return getLocalizedSitemapEntries().map((entry) => ({
    url: `${siteUrl}${entry.path}`,
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
    alternates: {
      languages: Object.fromEntries(
        Object.entries(entry.languages).map(([locale, path]) => [locale, `${siteUrl}${path}`]),
      ),
    },
  }));
}
