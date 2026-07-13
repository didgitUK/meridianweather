import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { AppProviders } from '@/providers/AppProviders';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { CookieBanner } from '@/components/layout/CookieBanner';
import { SkipToMainLink } from '@/components/layout/SkipToMainLink';
import { HtmlAttributes } from '@/components/layout/HtmlAttributes';
import { JsonLd } from '@/components/seo/JsonLd';
import { AnalyticsProvider } from '@/components/seo/AnalyticsProvider';
import { routing } from '@/i18n/routing';
import { buildOrganizationSchema, buildWebsiteSchema, ROOT_METADATA } from '@/lib/seo';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return ROOT_METADATA;
  }

  const t = await getTranslations({ locale, namespace: 'Seo' });

  return {
    ...ROOT_METADATA,
    title: {
      default: `${ROOT_METADATA.title.default.split(' — ')[0]} — ${t('homeTitle')}`,
      template: ROOT_METADATA.title.template,
    },
    description: t('homeDescription'),
    openGraph: {
      ...ROOT_METADATA.openGraph,
      title: `${ROOT_METADATA.openGraph.title.split(' — ')[0]} — ${t('homeTitle')}`,
      description: t('homeDescription'),
      locale: locale === 'en-GB' || locale === 'en' ? 'en_GB' : locale.replace('-', '_'),
    },
    twitter: {
      ...ROOT_METADATA.twitter,
      title: `${ROOT_METADATA.twitter.title.split(' — ')[0]} — ${t('homeTitle')}`,
      description: t('homeDescription'),
    },
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <>
      <HtmlAttributes locale={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} />
      <JsonLd data={buildOrganizationSchema()} />
      <JsonLd data={buildWebsiteSchema()} />
      <NextIntlClientProvider messages={messages}>
        <AppProviders>
          <AnalyticsProvider />
          <SkipToMainLink />
          <SiteHeader />
          <main id="main-content" className="flex-1 scroll-mt-6">
            {children}
          </main>
          <SiteFooter />
          <CookieBanner />
        </AppProviders>
      </NextIntlClientProvider>
    </>
  );
}
