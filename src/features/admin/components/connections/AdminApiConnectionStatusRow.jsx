import { AdminApiConnectionConnectLink } from '@/features/admin/components/connections/AdminApiConnectionConnectLink';
import { AdminApiConnectionStatusDot } from '@/features/admin/components/connections/AdminApiConnectionStatusDot';
import {
  ADMIN_CONNECTION_STATUS_LABEL,
  getAdminConnectionActionLabel,
  getAdminConnectionSectionId,
} from '@/constants/admin-connections';
import { cn } from '@/lib/utils';

export function AdminApiConnectionStatusRow({
  connection,
  nested = false,
  tone = 'light',
  onSectionChange,
}) {
  const statusLabel =
    ADMIN_CONNECTION_STATUS_LABEL[connection.status] ?? connection.status;
  const detail = connection.message || statusLabel;
  const isDark = tone === 'dark';
  const sectionId = getAdminConnectionSectionId(connection.id);
  const showAction = Boolean(onSectionChange && sectionId);

  return (
    <li
      className={cn(
        'flex min-h-7 items-center gap-2 py-0.5',
        nested && 'pl-2',
      )}
      title={detail}
    >
      <AdminApiConnectionStatusDot status={connection.status} />
      <div className="min-w-0 flex-1 leading-tight">
        <p
          className={cn(
            'truncate font-medium',
            nested ? 'text-[11px]' : 'text-xs',
            isDark ? 'text-white/90' : 'text-foreground',
          )}
        >
          {connection.label}
        </p>
        <p className={cn('truncate text-[11px]', isDark ? 'text-white/50' : 'text-muted-foreground')}>
          {statusLabel}
        </p>
      </div>
      {showAction ? (
        <AdminApiConnectionConnectLink
          label={getAdminConnectionActionLabel(connection.status)}
          tone={tone}
          onClick={() => onSectionChange(sectionId)}
        />
      ) : null}
    </li>
  );
}
