'use client';

import { useMemo } from 'react';
import { parseCityId } from '@/lib/utils';
import { useSavedCities } from '@/features/cities/hooks/useSavedCities';
import { readCheckedCity } from '@/features/cities/utils/checked-city-store';

export function useResolvedCity(cityId, initialCity = null) {
  const { savedCities, isHydrated } = useSavedCities();

  return useMemo(() => {
    if (initialCity?.id === cityId && initialCity.lat != null && initialCity.lon != null) {
      const pinned = savedCities.find((item) => item.id === cityId);
      return { city: initialCity, isHydrated: true, isPinned: Boolean(pinned) };
    }

    if (!isHydrated) {
      return { city: initialCity ?? null, isHydrated: false, isPinned: false };
    }

    const pinned = savedCities.find((item) => item.id === cityId);
    if (pinned) {
      return { city: pinned, isHydrated: true, isPinned: true };
    }

    const checked = readCheckedCity(cityId);
    if (checked?.lat != null && checked?.lon != null) {
      return { city: checked, isHydrated: true, isPinned: false };
    }

    const parsed = parseCityId(cityId);
    if (parsed) {
      return { city: parsed, isHydrated: true, isPinned: false };
    }

    return { city: null, isHydrated: true, isPinned: false };
  }, [cityId, initialCity, isHydrated, savedCities]);
}
