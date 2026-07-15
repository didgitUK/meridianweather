'use client';

import { useEffect, useState } from 'react';
import { DEBOUNCE_MS } from '@/constants/weather';
import { fetchJson } from '@/lib/client/fetch-json';
import { singleFlight } from '@/lib/client/single-flight';

export function buildGeocodeUrl(query, context) {
  const params = new URLSearchParams({ q: query });

  if (context?.country) {
    params.set('country', context.country);
  }

  if (context?.lat != null && context?.lon != null) {
    params.set('lat', String(context.lat));
    params.set('lon', String(context.lon));
  }

  return `/api/geocode?${params.toString()}`;
}

function fetchGeocodeOnce(url) {
  return singleFlight(`geocode:${url}`, () => fetchJson(url));
}

export function useCitySearch(geocodeContext) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const contextCountry = geocodeContext?.country ?? null;
  const contextLat = geocodeContext?.lat ?? null;
  const contextLon = geocodeContext?.lon ?? null;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      return undefined;
    }

    let cancelled = false;
    const context = {
      country: contextCountry,
      lat: contextLat,
      lon: contextLon,
    };

    async function runSearch() {
      setIsLoading(true);
      setError('');

      try {
        const payload = await fetchGeocodeOnce(buildGeocodeUrl(debouncedQuery, context));

        if (!cancelled) {
          setResults(payload.results ?? []);
        }
      } catch (searchError) {
        if (!cancelled) {
          setError(searchError.message);
          setResults([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    runSearch();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, contextCountry, contextLat, contextLon]);

  const shouldSearch = debouncedQuery.length >= 2;

  return {
    query,
    setQuery,
    results: shouldSearch ? results : [],
    isLoading: shouldSearch && isLoading,
    error: shouldSearch ? error : '',
  };
}
