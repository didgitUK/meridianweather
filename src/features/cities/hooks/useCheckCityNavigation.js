'use client';

import { useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { stashCheckedCity } from '@/features/cities/utils/checked-city-store';
import {
  buildCityDetailHref,
  buildWeatherPlaceHref,
} from '@/features/cities/utils/weather-place-href';
import { buildCityId } from '@/lib/utils';

/**
 * Navigate to a weather place URL for UK (with lat/lon query fallback), else /city/.
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
      const href = buildWeatherPlaceHref({
        ...city,
        name: result.name ?? city.name,
        country,
        lat: result.lat ?? city.lat,
        lon: result.lon ?? city.lon,
        state: result.state ?? city.state,
      });
      if (href) {
        router.push(href);
        return;
      }
    }

    const cityHref = buildCityDetailHref(city);
    if (cityHref) {
      router.push(cityHref);
    }
  }, [router]);
}
