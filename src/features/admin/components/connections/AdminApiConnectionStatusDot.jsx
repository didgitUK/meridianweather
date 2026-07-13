import { cn } from '@/lib/utils';
import {
  ADMIN_CONNECTION_STATUS,
  ADMIN_CONNECTION_STATUS_LABEL,
} from '@/constants/admin-connections';

const DOT_CLASS_BY_STATUS = {
  [ADMIN_CONNECTION_STATUS.CHECKING]: 'bg-muted-foreground/50 animate-pulse',
  [ADMIN_CONNECTION_STATUS.CONNECTED]: 'bg-emerald-500',
  [ADMIN_CONNECTION_STATUS.CONFIGURED]: 'bg-sky-500',
  [ADMIN_CONNECTION_STATUS.NOT_CONFIGURED]: 'bg-muted-foreground/40',
  [ADMIN_CONNECTION_STATUS.ERROR]: 'bg-destructive',
  [ADMIN_CONNECTION_STATUS.PENDING]: 'bg-amber-500',
  [ADMIN_CONNECTION_STATUS.DISABLED]: 'bg-muted-foreground/40',
  [ADMIN_CONNECTION_STATUS.ACTIVE]: 'bg-emerald-500',
  [ADMIN_CONNECTION_STATUS.INACTIVE]: 'bg-muted-foreground/40',
};

export function AdminApiConnectionStatusDot({ status }) {
  const label = ADMIN_CONNECTION_STATUS_LABEL[status] ?? status;

  return (
    <span
      role="status"
      aria-label={label}
      title={label}
      className={cn(
        'inline-block size-2 shrink-0 rounded-full',
        DOT_CLASS_BY_STATUS[status] ?? DOT_CLASS_BY_STATUS[ADMIN_CONNECTION_STATUS.PENDING],
      )}
    />
  );
}
