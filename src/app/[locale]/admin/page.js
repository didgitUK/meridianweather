import { setRequestLocale } from 'next-intl/server';
import { AdminDashboard } from '@/features/admin/components/AdminDashboard';
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Admin dashboard',
  description: 'Private meridian administration dashboard.',
  path: '/admin',
  robots: ROBOTS_NOINDEX,
});

export default async function AdminPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminDashboard />;
}
