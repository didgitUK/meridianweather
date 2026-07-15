'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { AdminApiConnectionEmailGroup } from '@/features/admin/components/connections/AdminApiConnectionEmailGroup';
import { AdminApiConnectionStatusDot } from '@/features/admin/components/connections/AdminApiConnectionStatusDot';
import { AdminApiConnectionStatusRow } from '@/features/admin/components/connections/AdminApiConnectionStatusRow';
import { useAdminApiConnections } from '@/features/admin/hooks/useAdminApiConnections';
import {
  ADMIN_CONNECTION_KIND,
  ADMIN_CONNECTION_STATUS,
} from '@/constants/admin-connections';
import { cn } from '@/lib/utils';

const STATUS_RANK = {
  [ADMIN_CONNECTION_STATUS.ERROR]: 5,
  [ADMIN_CONNECTION_STATUS.PENDING]: 4,
  [ADMIN_CONNECTION_STATUS.NOT_CONFIGURED]: 3,
  [ADMIN_CONNECTION_STATUS.CHECKING]: 2,
  [ADMIN_CONNECTION_STATUS.DISABLED]: 1,
  [ADMIN_CONNECTION_STATUS.INACTIVE]: 1,
  [ADMIN_CONNECTION_STATUS.CONFIGURED]: 0,
  [ADMIN_CONNECTION_STATUS.CONNECTED]: 0,
  [ADMIN_CONNECTION_STATUS.ACTIVE]: 0,
};

function flattenStatuses(connections) {
  const statuses = [];
  for (const connection of connections) {
    if (connection.kind === ADMIN_CONNECTION_KIND.GROUP) {
      for (const child of connection.children ?? []) {
        statuses.push(child.status);
      }
    } else {
      statuses.push(connection.status);
    }
  }
  return statuses;
}

function worstStatus(connections) {
  const statuses = flattenStatuses(connections);
  if (statuses.length === 0) {
    return ADMIN_CONNECTION_STATUS.CHECKING;
  }
  return statuses.reduce((worst, status) =>
    (STATUS_RANK[status] ?? 0) > (STATUS_RANK[worst] ?? 0) ? status : worst,
  );
}

export function AdminApiConnectionStatuses({ tone = 'light', onSectionChange }) {
  const { connections, error, refresh } = useAdminApiConnections();
  const isDark = tone === 'dark';
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const closeTimerRef = useRef(null);
  const panelId = useId();
  const aggregateStatus = useMemo(() => worstStatus(connections), [connections]);

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 180);
  }

  useEffect(() => () => clearCloseTimer(), []);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const list = (
    <ul className="flex flex-col" aria-label="API connection statuses">
      {connections.map((connection) =>
        connection.kind === ADMIN_CONNECTION_KIND.GROUP ? (
          <AdminApiConnectionEmailGroup
            key={connection.id}
            connection={connection}
            tone={tone}
            onSectionChange={onSectionChange}
          />
        ) : (
          <AdminApiConnectionStatusRow
            key={connection.id}
            connection={connection}
            tone={tone}
            onSectionChange={onSectionChange}
          />
        ),
      )}
    </ul>
  );

  if (!isDark) {
    return (
      <div className="mt-4 w-full border-t border-border/60 pt-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            API connections
          </p>
          <button
            type="button"
            onClick={() => refresh({ force: true })}
            className="text-[11px] text-muted-foreground underline-offset-2 hover:underline hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Refresh
          </button>
        </div>
        {list}
        {error ? (
          <p className="mt-2 text-[11px] text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="relative w-full"
      onMouseEnter={() => {
        clearCloseTimer();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
          'hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
          open && 'bg-white/5',
        )}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        onFocus={() => {
          clearCloseTimer();
          setOpen(true);
        }}
      >
        <AdminApiConnectionStatusDot status={aggregateStatus} />
        <span className="min-w-0 flex-1 text-[11px] font-medium tracking-wide text-white/70 uppercase">
          API
        </span>
        <ChevronRight
          className={cn(
            'size-3.5 text-white/40 transition-transform',
            open && '-rotate-90',
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={panelId}
          role="region"
          aria-label="API connection details"
          className="absolute bottom-0 left-full z-50 ml-2 flex max-h-[min(28rem,calc(100vh-6rem))] w-64 flex-col rounded-lg border border-white/10 bg-neutral-950 p-3 shadow-xl shadow-black/40"
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        >
          <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
            <p className="text-[11px] font-medium tracking-wide text-white/50 uppercase">
              API connections
            </p>
            <button
              type="button"
              onClick={() => refresh({ force: true })}
              className="text-[11px] text-white/60 underline-offset-2 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              Refresh
            </button>
          </div>
          <div className="meridian-scrollbar-sidebar min-h-0 flex-1 overflow-y-auto">
            {list}
          </div>
          {error ? (
            <p className="mt-2 shrink-0 text-[11px] text-red-300" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
