import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { CmsBody } from '@/components/cms/CmsBody';
import { PageSection } from '@/components/layout/PageSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';
import { buildArticleSchema, buildBreadcrumbSchema } from '@/lib/seo';
import { cn } from '@/lib/utils';

/**
 * @param {{
 *   article: {
 *     title: string,
 *     excerpt: string,
 *     category: string,
 *     bodyHtml: string,
 *     dateIso?: string,
 *     dateLabel?: string,
 *     href: string,
 *     imageUrl?: string | null,
 *     imageCredit?: string | null,
 *     imageSourceUrl?: string | null,
 *     sources?: Array<{ title?: string, url?: string, publisher?: string }>,
 *     publishedAt?: string | null,
 *     generatedAt?: string,
 *   },
 *   place: { name: string, slug: string },
 *   locale: string,
 * }} props
 */
export async function PlaceGuidePage({ article, place, localePath }) {
  const t = await getTranslations('PlaceContent.guidePage');
  const placePath = `/weather/${place.slug}`;
  const guidePath = article.href || `${placePath}/guides/${article.slug}`;

  return (
    <>
      <JsonLd
        data={buildArticleSchema({
          title: article.title,
          description: article.excerpt,
          path: localePath || guidePath,
          dateIso: article.dateIso || article.publishedAt || article.generatedAt,
          imageUrl: article.imageUrl,
          category: article.category,
        })}
      />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: place.name, path: placePath },
          { name: article.title, path: guidePath },
        ])}
      />

      <header className="relative isolate w-full overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 z-0" aria-hidden>
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
              unoptimized
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/35" />
        </div>

        <div
          className={cn(
            'relative z-10 mx-auto flex w-full max-w-6xl flex-col justify-end',
            SPACING.pageX,
            'min-h-[18rem] py-10 sm:min-h-[22rem] sm:py-14',
          )}
        >
          <div className="flex max-w-3xl flex-col gap-4 text-white">
            <p className="text-sm text-white/80">
              <Link
                href={placePath}
                className="underline-offset-4 hover:text-white hover:underline"
              >
                {t('backToPlace', { place: place.name })}
              </Link>
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-white/75">
              <span>{article.category}</span>
              <span aria-hidden>·</span>
              <time dateTime={article.dateIso ?? article.dateLabel}>
                {article.dateLabel}
              </time>
            </div>
            <h1 className={cn(TYPOGRAPHY.displaySm, 'text-balance text-white')}>
              {article.title}
            </h1>
            <p className="text-base text-white/85 sm:text-lg">{article.excerpt}</p>
            <p className="text-sm text-white/70">{t('byline')}</p>
          </div>
        </div>
      </header>

      <PageSection>
        <article className="mx-auto flex w-full max-w-3xl flex-col gap-8">
          <CmsBody html={article.bodyHtml} />

          {article.imageCredit || article.imageSourceUrl ? (
            <p className="text-sm text-muted-foreground">
              {t('imageCredit')}:{' '}
              {article.imageSourceUrl ? (
                <a
                  href={article.imageSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-4 hover:underline"
                >
                  {article.imageCredit || article.imageSourceUrl}
                </a>
              ) : (
                article.imageCredit
              )}
            </p>
          ) : null}

          {Array.isArray(article.sources) && article.sources.length > 0 ? (
            <section aria-labelledby="place-guide-sources">
              <h2
                id="place-guide-sources"
                className={cn(TYPOGRAPHY.heading, 'text-lg')}
              >
                {t('sourcesTitle')}
              </h2>
              <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm">
                {article.sources.map((source, index) => (
                  <li key={`${source.url}-${index}`}>
                    {source.url ? (
                      <a
                        href={source.url}
                        target={source.url.startsWith('http') ? '_blank' : undefined}
                        rel={source.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {source.title || source.url}
                      </a>
                    ) : (
                      <span>{source.title}</span>
                    )}
                    {source.publisher ? (
                      <span className="text-muted-foreground"> — {source.publisher}</span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </article>
      </PageSection>
    </>
  );
}
