'use client';

import { useCallback } from 'react';

import { STORAGE_KEYS } from '@/constants/storage-keys';
import { CITY_DETAIL_ACCORDION_CONDITIONS } from '@/constants/city-detail';
import { useLocalStorageValue, writeLocalStorageValue } from '@/hooks/use-browser-storage';
import {
  parseCityDetailAccordion,
  serializeCityDetailAccordion,
} from '@/features/weather/utils/city-detail-accordion-storage';

export function useCityDetailAccordion() {
  const raw = useLocalStorageValue(
    STORAGE_KEYS.cityDetailAccordion,
    JSON.stringify([CITY_DETAIL_ACCORDION_CONDITIONS]),
  );
  const openSections = parseCityDetailAccordion(raw);

  const setOpenSections = useCallback((next) => {
    const resolved = typeof next === 'function' ? next(parseCityDetailAccordion(raw)) : next;

    writeLocalStorageValue(
      STORAGE_KEYS.cityDetailAccordion,
      serializeCityDetailAccordion(resolved),
    );
  }, [raw]);

  return { openSections, setOpenSections };
}
