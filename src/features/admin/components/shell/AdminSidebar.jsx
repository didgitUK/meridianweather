'use client';

import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminSidebarHeader } from '@/features/admin/components/shell/AdminSidebarHeader';
import { AdminSidebarProfileCard } from '@/features/admin/components/shell/AdminSidebarProfileCard';
import { AdminSidebarNav } from '@/features/admin/components/AdminSidebarNav';
import { cn } from '@/lib/utils';

export function AdminSidebar({
  activeSection,
  onSectionChange,
  user,
  onOpenProfile,
  onLogout,
  mobileOpen,
  onMobileOpenChange,
}) {
  const sidebar = (
    <aside
      className={cn(
        'flex h-full w-64 flex-col overflow-visible bg-neutral-950 text-white',
        'lg:fixed lg:inset-y-0 lg:left-0 lg:z-40',
      )}
    >
      <AdminSidebarHeader />
      <AdminSidebarNav activeSection={activeSection} onSectionChange={onSectionChange} />
      <AdminSidebarProfileCard user={user} onOpenProfile={onOpenProfile} onLogout={onLogout} />
    </aside>
  );

  return (
    <>
      <div className="flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden dark:bg-background">
        <p className="font-heading text-lg">Admin</p>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          onClick={() => onMobileOpenChange(!mobileOpen)}
        >
          {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </Button>
      </div>

      <div className="hidden lg:block">{sidebar}</div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="absolute inset-0 bg-black/50"
            onClick={() => onMobileOpenChange(false)}
          />
          <div className="absolute inset-y-0 left-0 shadow-xl">{sidebar}</div>
        </div>
      ) : null}
    </>
  );
}
