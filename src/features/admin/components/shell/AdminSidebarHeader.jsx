'use client';

import { Link } from '@/i18n/navigation';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { AdminSidebarThemeToggle } from '@/features/admin/components/shell/AdminSidebarThemeToggle';

export function AdminSidebarHeader() {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-4">
      <Link href="/" className="inline-flex min-w-0 items-center" aria-label="Meridian home">
        <BrandLogo size="md" variant="on-dark" className="max-w-[10rem] sm:max-w-[10rem] md:max-w-[10rem]" />
      </Link>
      <AdminSidebarThemeToggle />
    </div>
  );
}
