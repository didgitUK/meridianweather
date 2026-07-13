'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useDebouncedAdminSave(saveFn, delayMs = 500) {
  const timeoutRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const save = useCallback(
    (partial) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(async () => {
        setIsSaving(true);
        setError(null);

        try {
          const response = await fetch('/api/admin/config', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(partial),
          });
          const payload = await response.json();

          if (!response.ok) {
            throw new Error(payload.message ?? 'Unable to save settings');
          }

          await saveFn(payload);
        } catch (saveError) {
          setError(saveError.message);
        } finally {
          setIsSaving(false);
        }
      }, delayMs);
    },
    [delayMs, saveFn],
  );

  useEffect(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { save, isSaving, error };
}
