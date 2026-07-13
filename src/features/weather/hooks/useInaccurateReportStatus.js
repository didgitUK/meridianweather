'use client';

import { useCallback, useEffect, useState } from 'react';

export function useInaccurateReportStatus(city, isHydrated) {
  const [status, setStatus] = useState({ active: false, reportedAt: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadedKey, setLoadedKey] = useState('');

  const lat = city?.lat;
  const lon = city?.lon;
  const requestKey = lat != null && lon != null ? `${lat}:${lon}` : '';

  useEffect(() => {
    if (!isHydrated || !requestKey) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const params = new URLSearchParams({
          lat: String(lat),
          lon: String(lon),
        });
        const response = await fetch(`/api/weather/inaccurate-report?${params.toString()}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message ?? 'Unable to load report status');
        }

        if (!cancelled) {
          setStatus(payload);
          setLoadedKey(requestKey);
        }
      } catch {
        if (!cancelled) {
          setLoadedKey(requestKey);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isHydrated, lat, lon, requestKey]);

  const submitReport = useCallback(async () => {
    if (city?.lat == null || city?.lon == null || isSubmitting) {
      return status;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/weather/inaccurate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: city.lat,
          lon: city.lon,
          name: city.name,
          country: city.country,
          state: city.state,
          label: [city.name, city.state, city.country].filter(Boolean).join(', '),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to submit report');
      }

      setStatus(payload);
      return payload;
    } finally {
      setIsSubmitting(false);
    }
  }, [city, isSubmitting, status]);

  return {
    isActive: status.active,
    reportedAt: status.reportedAt,
    isLoading: Boolean(isHydrated && requestKey && loadedKey !== requestKey),
    isSubmitting,
    submitReport,
  };
}
