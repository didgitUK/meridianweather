import { notFound } from 'next/navigation';
import { LegalPageTemplate } from '@/components/legal/LegalPageTemplate';
import { getPolicyBySlug } from '@/content/legal';
import { buildLegalPageMetadata } from '@/lib/page-metadata';
import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const policy = getPolicyBySlug('cookies');
  if (!policy) {
    return {};
  }

  return buildLegalPageMetadata(policy, locale);
}

export default async function CookiesPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const policy = getPolicyBySlug('cookies');
  if (!policy) {
    notFound();
  }

  return <LegalPageTemplate policy={policy} />;
}
