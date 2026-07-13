'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ADMIN_CONNECTIONS,
  ADMIN_CONNECTION_KIND,
  ADMIN_CONNECTION_STATUS,
} from '@/constants/admin-connections';
import { EMAIL_PROVIDER_OPTIONS } from '@/constants/email-providers';

function buildCheckingPlaceholders() {
  return ADMIN_CONNECTIONS.map((definition) => {
    if (definition.kind === ADMIN_CONNECTION_KIND.GROUP) {
      return {
        id: definition.id,
        label: definition.label,
        description: definition.description,
        kind: ADMIN_CONNECTION_KIND.GROUP,
        checkMode: definition.checkMode,
        status: ADMIN_CONNECTION_STATUS.CHECKING,
        message: '',
        checkedAt: null,
        children: EMAIL_PROVIDER_OPTIONS.map((option) => ({
          id: `email-${option.id}`,
          providerId: option.id,
          label: option.label,
          active: false,
          status: ADMIN_CONNECTION_STATUS.CHECKING,
          message: '',
          checkedAt: null,
        })),
      };
    }

    return {
      id: definition.id,
      label: definition.label,
      description: definition.description,
      kind: definition.kind ?? ADMIN_CONNECTION_KIND.ITEM,
      checkMode: definition.checkMode,
      status: ADMIN_CONNECTION_STATUS.CHECKING,
      message: '',
      checkedAt: null,
    };
  });
}

/**
 * Loads `/api/admin/connections`.
 */
export function useAdminApiConnections() {
  const [connections, setConnections] = useState(buildCheckingPlaceholders);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async ({ force = false } = {}) => {
    setError('');

    try {
      const url = force ? '/api/admin/connections?force=1' : '/api/admin/connections';
      const response = await fetch(url);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? 'Unable to load connection statuses');
      }

      setConnections(payload.connections ?? []);
    } catch (loadError) {
      setError(loadError.message);
      setConnections((current) =>
        current.map((item) => {
          if (item.kind === ADMIN_CONNECTION_KIND.GROUP) {
            return {
              ...item,
              status:
                item.status === ADMIN_CONNECTION_STATUS.CHECKING
                  ? ADMIN_CONNECTION_STATUS.ERROR
                  : item.status,
              message: loadError.message,
              children: (item.children ?? []).map((child) =>
                child.status === ADMIN_CONNECTION_STATUS.CHECKING
                  ? {
                      ...child,
                      status: ADMIN_CONNECTION_STATUS.ERROR,
                      message: loadError.message,
                    }
                  : child,
              ),
            };
          }

          return item.status === ADMIN_CONNECTION_STATUS.CHECKING
            ? {
                ...item,
                status: ADMIN_CONNECTION_STATUS.ERROR,
                message: loadError.message,
              }
            : item;
        }),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (cancelled) {
        return;
      }
      await refresh();
    })();

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return { connections, error, isLoading, refresh };
}
