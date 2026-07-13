'use client';

import { cn } from '@/lib/utils';

export function AdminApiConnectionConnectLink({ label, onClick, tone = 'light' }) {
  const isDark = tone === 'dark';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 text-[11px] whitespace-nowrap underline-offset-2 hover:underline',
        'focus-visible:outline-none focus-visible:ring-2',
        isDark
          ? 'text-white/60 hover:text-white focus-visible:ring-white/40'
          : 'text-muted-foreground hover:text-foreground focus-visible:ring-ring',
      )}
    >
      {label}
    </button>
  );
}
