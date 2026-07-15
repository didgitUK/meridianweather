import {
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Loader2,
  Plug,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ADMIN_CONNECTION_STATUS,
  ADMIN_CONNECTION_STATUS_LABEL,
} from '@/constants/admin-connections';

const STATUS_ICON = {
  [ADMIN_CONNECTION_STATUS.CHECKING]: {
    Icon: Loader2,
    className: 'text-white/40 animate-spin',
  },
  [ADMIN_CONNECTION_STATUS.CONNECTED]: {
    Icon: CheckCircle2,
    className: 'text-emerald-400',
  },
  [ADMIN_CONNECTION_STATUS.CONFIGURED]: {
    Icon: Plug,
    className: 'text-sky-400',
  },
  [ADMIN_CONNECTION_STATUS.NOT_CONFIGURED]: {
    Icon: CircleDashed,
    className: 'text-white/35',
  },
  [ADMIN_CONNECTION_STATUS.ERROR]: {
    Icon: AlertCircle,
    className: 'text-red-400',
  },
  [ADMIN_CONNECTION_STATUS.PENDING]: {
    Icon: Clock3,
    className: 'text-amber-400',
  },
  [ADMIN_CONNECTION_STATUS.DISABLED]: {
    Icon: CircleDashed,
    className: 'text-white/35',
  },
  [ADMIN_CONNECTION_STATUS.ACTIVE]: {
    Icon: CheckCircle2,
    className: 'text-emerald-400',
  },
  [ADMIN_CONNECTION_STATUS.INACTIVE]: {
    Icon: CircleDashed,
    className: 'text-white/35',
  },
};

const LIGHT_STATUS_ICON = {
  [ADMIN_CONNECTION_STATUS.CHECKING]: {
    Icon: Loader2,
    className: 'text-muted-foreground animate-spin',
  },
  [ADMIN_CONNECTION_STATUS.CONNECTED]: {
    Icon: CheckCircle2,
    className: 'text-emerald-600',
  },
  [ADMIN_CONNECTION_STATUS.CONFIGURED]: {
    Icon: Plug,
    className: 'text-sky-600',
  },
  [ADMIN_CONNECTION_STATUS.NOT_CONFIGURED]: {
    Icon: CircleDashed,
    className: 'text-muted-foreground/70',
  },
  [ADMIN_CONNECTION_STATUS.ERROR]: {
    Icon: AlertCircle,
    className: 'text-destructive',
  },
  [ADMIN_CONNECTION_STATUS.PENDING]: {
    Icon: Clock3,
    className: 'text-amber-600',
  },
  [ADMIN_CONNECTION_STATUS.DISABLED]: {
    Icon: CircleDashed,
    className: 'text-muted-foreground/70',
  },
  [ADMIN_CONNECTION_STATUS.ACTIVE]: {
    Icon: CheckCircle2,
    className: 'text-emerald-600',
  },
  [ADMIN_CONNECTION_STATUS.INACTIVE]: {
    Icon: CircleDashed,
    className: 'text-muted-foreground/70',
  },
};

export function AdminApiConnectionStatusDot({ status, tone = 'dark' }) {
  const label = ADMIN_CONNECTION_STATUS_LABEL[status] ?? status;
  const map = tone === 'light' ? LIGHT_STATUS_ICON : STATUS_ICON;
  const config = map[status] ?? map[ADMIN_CONNECTION_STATUS.PENDING];
  const Icon = config.Icon;

  return (
    <span role="status" aria-label={label} title={label} className="inline-flex shrink-0">
      <Icon className={cn('size-3.5', config.className)} aria-hidden />
    </span>
  );
}
