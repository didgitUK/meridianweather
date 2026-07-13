import { getLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { isAdminSessionActive } from '@/lib/server/admin-auth';

export default async function AdminLayout({ children }) {
  if (!(await isAdminSessionActive())) {
    const locale = await getLocale();
    redirect({ href: '/login', locale });
  }

  return children;
}
