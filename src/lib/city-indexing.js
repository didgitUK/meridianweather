import { revalidatePath } from 'next/cache';
import { routing } from '@/i18n/routing';
import { buildLocalizedPath } from '@/i18n/seo';

export function revalidateIndexableCityPaths(slug) {
  if (!slug) {
    return;
  }

  for (const locale of routing.locales) {
    revalidatePath(buildLocalizedPath(`/city/${slug}`, locale));
  }

  revalidatePath('/sitemap.xml');
}
