'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CitySearchSheet } from '@/features/cities/components/CitySearchSheet';
import { useCheckCityNavigation } from '@/features/cities/hooks/useCheckCityNavigation';

const LocationSearchContext = createContext({
  openSearch: () => {},
  closeSearch: () => {},
  isSearchOpen: false,
});

export function LocationSearchProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');
  const navigateToCity = useCheckCityNavigation();
  const [onSelectOverride, setOnSelectOverride] = useState(null);

  const openSearch = useCallback((options = {}) => {
    setInitialQuery(typeof options.initialQuery === 'string' ? options.initialQuery : '');
    setOnSelectOverride(() => options.onSelect ?? null);
    setOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSelect = useCallback(
    (result) => {
      const handler = onSelectOverride ?? navigateToCity;
      handler(result);
      setOpen(false);
      setOnSelectOverride(null);
    },
    [navigateToCity, onSelectOverride],
  );

  const value = useMemo(
    () => ({
      openSearch,
      closeSearch,
      isSearchOpen: open,
    }),
    [closeSearch, open, openSearch],
  );

  return (
    <LocationSearchContext.Provider value={value}>
      {children}
      <CitySearchSheet
        open={open}
        onOpenChange={setOpen}
        initialQuery={initialQuery}
        onSelect={handleSelect}
      />
    </LocationSearchContext.Provider>
  );
}

export function useLocationSearch() {
  return useContext(LocationSearchContext);
}
