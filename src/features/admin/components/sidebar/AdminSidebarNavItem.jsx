'use client';

import { cn } from '@/lib/utils';

export function AdminSidebarNavItem({ label, icon: Icon, isActive, onClick, tone = 'light' }) {
  const isDark = tone === 'dark';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium whitespace-nowrap transition-colors',
        'focus-visible:outline-none focus-visible:ring-2',
        isDark
          ? cn(
              'focus-visible:ring-white/40',
              isActive
                ? 'bg-white/15 text-white'
                : 'text-white/65 hover:bg-white/10 hover:text-white',
            )
          : cn(
              'focus-visible:ring-ring',
              isActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            ),
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span>{label}</span>
    </button>
  );
}
