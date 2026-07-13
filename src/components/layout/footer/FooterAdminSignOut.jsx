'use client';

import { useRouter } from '@/i18n/navigation';

export function FooterAdminSignOut({ className }) {
  const router = useRouter();

  async function handleSignOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={`cursor-pointer border-0 bg-transparent p-0 text-left ${className}`}
    >
      Sign out
    </button>
  );
}
