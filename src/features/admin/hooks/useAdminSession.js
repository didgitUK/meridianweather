'use client';

import { useEffect, useState } from 'react';

export function useAdminSession() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/auth/session')
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled) {
          setIsAuthenticated(Boolean(payload.authenticated));
          setUser(payload.user ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsAuthenticated(false);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { isAuthenticated, user, isLoading };
}
