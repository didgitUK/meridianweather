'use client';

import { useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { stashCheckedCity } from '@/features/cities/utils/checked-city-store';
import { buildCityId, slugify } from '@/lib/utils';

/**
 * Navigate to a weather place URL for UK SEO slugs when possible, else legacy /city/.
 * Client cannot query SQLite; uses a best-effort slug for GB results and lets the
 * weather route 404→search fallback via resolve. Server redirects cover indexed places.
 */
export function useCheckCityNavigation() {
  const router = useRouter();

  return useCallback((result) => {
    const city = stashCheckedCity({
      ...result,
      id: buildCityId(result.name, result.country, result.lat),
    });

    const country = String(result.country ?? '').toUpperCase();
    if (country === 'GB' || country === 'UK') {
      const seoSlug = slugify(result.name);
      router.push(`/weather/${encodeURIComponent(seoSlug)}`);
      return;
    }

    router.push(`/city/${encodeURIComponent(city.id)}`);
  }, [router]);
}
