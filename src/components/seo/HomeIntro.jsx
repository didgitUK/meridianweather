import { getTranslations } from 'next-intl/server';

export async function HomeIntro() {
  const t = await getTranslations('Seo');

  return (
    <section className="sr-only">
      <h1>meridian — {t('homeTitle')}</h1>
      <p>{t('homeIntro')}</p>
    </section>
  );
}
