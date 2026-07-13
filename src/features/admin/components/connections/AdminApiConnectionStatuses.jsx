'use client';

import { AdminApiConnectionEmailGroup } from '@/features/admin/components/connections/AdminApiConnectionEmailGroup';
import { AdminApiConnectionStatusRow } from '@/features/admin/components/connections/AdminApiConnectionStatusRow';
import { useAdminApiConnections } from '@/features/admin/hooks/useAdminApiConnections';
import { ADMIN_CONNECTION_KIND } from '@/constants/admin-connections';
import { cn } from '@/lib/utils';

export function AdminApiConnectionStatuses({ tone = 'light', onSectionChange }) {
  const { connections, error, refresh } = useAdminApiConnections();
  const isDark = tone === 'dark';

  return (
    <div className={cn('w-full lg:w-56', !isDark && 'mt-4 border-t border-border/60 pt-4')}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p
          className={cn(
            'text-[11px] font-medium tracking-wide uppercase',
            isDark ? 'text-white/50' : 'text-muted-foreground',
          )}
        >
          API connections
        </p>
        <button
          type="button"
          onClick={() => refresh({ force: true })}
          className={cn(
            'text-[11px] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2',
            isDark
              ? 'text-white/60 hover:text-white focus-visible:ring-white/40'
              : 'text-muted-foreground hover:text-foreground focus-visible:ring-ring',
          )}
        >
          Refresh
        </button>
      </div>

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

      {error ? (
        <p className={cn('mt-2 text-[11px]', isDark ? 'text-red-300' : 'text-destructive')} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
