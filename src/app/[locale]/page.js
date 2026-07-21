import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DashboardPage } from '@/features/weather/components/DashboardPage';
import { DashboardHeroSection } from '@/features/weather/components/DashboardHeroSection';
import { DashboardHeroWithCheck } from '@/features/weather/components/DashboardHeroWithCheck';
import { HeroImagePreload } from '@/features/weather/components/HeroImagePreload';
import { isCityHeroOsmEnabled } from '@/lib/city-hero-flags';
import { HomeIntro } from '@/components/seo/HomeIntro';
import { buildLanguageAlternates, buildLocalizedPath, getOgLocale } from '@/i18n/seo';
import { resolveRegionHint } from '@/lib/geo/resolve-region-hint';
import { getHeroImageForRegion } from '@/lib/hero-image/get-hero-image-for-region';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Seo' });

  return buildPageMetadata({
    title: t('homeTitle'),
    description: t('homeDescription'),
    path: buildLocalizedPath('/', locale),
    locale: getOgLocale(locale),
    languages: buildLanguageAlternates('/'),
  });
}

export default async function Home({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Map-first heroes: skip stock Unsplash/static photo resolve on the home demo.
  const heroImage = isCityHeroOsmEnabled()
    ? null
    : await (async () => {
        const requestHeaders = await headers();
        const region = await resolveRegionHint({ headers: requestHeaders });
        return region ? getHeroImageForRegion(region) : null;
      })();

  return (
    <>
      <HeroImagePreload
        landscapeUrl={heroImage?.landscape?.imageUrl}
        portraitUrl={heroImage?.portrait?.imageUrl}
      />
      <HomeIntro />
      <DashboardHeroSection heroImage={heroImage}>
        <DashboardHeroWithCheck />
      </DashboardHeroSection>
      <DashboardPage />
    </>
  );
}
