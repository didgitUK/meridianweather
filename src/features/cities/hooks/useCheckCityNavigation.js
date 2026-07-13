'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { stashCheckedCity } from '@/features/cities/utils/checked-city-store';
import { buildCityId } from '@/lib/utils';

export function useCheckCityNavigation() {
  const router = useRouter();

  return useCallback((result) => {
    const city = stashCheckedCity({
      ...result,
      id: buildCityId(result.name, result.country, result.lat),
    });

    router.push(`/city/${encodeURIComponent(city.id)}`);
  }, [router]);
}
