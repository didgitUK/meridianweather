import { getLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';

export default async function LegalIndexPage() {
  const locale = await getLocale();
  redirect({ href: '/legal/terms', locale });
}
