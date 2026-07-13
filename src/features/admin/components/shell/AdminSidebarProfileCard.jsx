'use client';

import { LogOut, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function initialsFor(user) {
  const source = user?.displayName || user?.email || 'A';
  const parts = source.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function AdminSidebarProfileCard({ user, onOpenProfile, onLogout }) {
  const name = user?.displayName || 'Admin';
  const email = user?.email || 'Signed in';

  return (
    <div className="border-t border-white/10 p-3">
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <button
          type="button"
          onClick={onOpenProfile}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg text-left transition-colors',
            'hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
          )}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
            {user ? initialsFor(user) : <UserRound className="size-4" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-white">{name}</span>
            <span className="block truncate text-xs text-white/60">{email}</span>
          </span>
        </button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
          onClick={onLogout}
        >
          <LogOut className="size-3.5" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
