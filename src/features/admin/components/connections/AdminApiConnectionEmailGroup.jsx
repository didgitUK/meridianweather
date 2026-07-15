import { AdminApiConnectionStatusRow } from '@/features/admin/components/connections/AdminApiConnectionStatusRow';
import { cn } from '@/lib/utils';

export function AdminApiConnectionEmailGroup({ connection, tone = 'light', onSectionChange }) {
  const children = connection.children ?? [];
  const isDark = tone === 'dark';

  return (
    <li className="flex flex-col gap-0.5 pt-1">
      <p
        className={cn(
          'px-0 text-[11px] font-medium tracking-wide uppercase',
          isDark ? 'text-white/50' : 'text-muted-foreground',
        )}
      >
        {connection.label}
      </p>
      <ul
        className={cn(
          'flex flex-col border-l pl-2',
          isDark ? 'border-white/15' : 'border-border/60',
        )}
        aria-label={`${connection.label} connector statuses`}
      >
        {children.map((child) => (
          <AdminApiConnectionStatusRow
            key={child.id}
            connection={child}
            nested
            tone={tone}
            onSectionChange={onSectionChange}
          />
        ))}
      </ul>
    </li>
  );
}
