import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { CmsBody } from '@/components/cms/CmsBody';
import { PageSection } from '@/components/layout/PageSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';
import { buildArticleSchema, buildBreadcrumbSchema } from '@/lib/seo';
import { cn } from '@/lib/utils';

const CMS_BODY_CLASS =
  'flex flex-col gap-5 text-base leading-relaxed text-foreground/90 [&_a]:text-primary [&_a]:underline [&_h2]:font-heading [&_h2]:text-2xl [&_h3]:font-heading [&_h3]:text-xl [&_li]:ms-5 [&_ol]:list-decimal [&_ul]:list-disc';

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
 *     slug?: string,
 *     imageUrl?: string | null,
 *     imageCredit?: string | null,
 *     imageSourceUrl?: string | null,
 *     sources?: Array<{ title?: string, url?: string, publisher?: string }>,
 *     publishedAt?: string | null,
 *     generatedAt?: string,
 *   },
 *   place: { name: string, slug: string },
 *   localePath?: string,
 *   relatedArticles?: Array<{
 *     id?: string,
 *     slug: string,
 *     title: string,
 *     href: string,
 *     category?: string,
 *     dateLabel?: string,
 *   }>,
 * }} props
 */
export async function PlaceGuidePage({
  article,
  place,
  localePath,
  relatedArticles = [],
}) {
  const t = await getTranslations('PlaceContent.guidePage');
  const tThings = await getTranslations('PlaceContent.thingsToDo');
  const placePath = `/weather/${place.slug}`;
  const guidePath = article.href || `${placePath}/guides/${article.slug}`;
  const thingsAnchor = `${placePath}#place-things-to-do-heading`;
  const updatedLabel = article.dateLabel
    ? t('updated', { date: article.dateLabel })
    : null;

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
            'min-h-[18rem] py-10 sm:min-h-[22rem] sm:py-14 md:min-h-[26rem] md:py-16',
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
            <h1
              className={cn(
                TYPOGRAPHY.displaySm,
                TYPOGRAPHY.heading,
                'text-balance text-white',
              )}
            >
              {article.title}
            </h1>
            <p className="text-base text-white/85 sm:text-lg">{article.excerpt}</p>
            <p className="text-sm text-white/70">
              {[t('byline'), updatedLabel].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
      </header>

      <PageSection>
        <Breadcrumbs
          items={[
            { name: place.name, path: placePath },
            { name: article.title, path: guidePath },
          ]}
        />

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-12">
          <article className={cn('flex min-w-0 w-full flex-col', SPACING.stack6)}>
            <CmsBody html={article.bodyHtml} className={CMS_BODY_CLASS} />

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
                          rel={
                            source.url.startsWith('http')
                              ? 'noopener noreferrer'
                              : undefined
                          }
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {source.title || source.url}
                        </a>
                      ) : (
                        <span>{source.title}</span>
                      )}
                      {source.publisher ? (
                        <span className="text-muted-foreground">
                          {' '}
                          — {source.publisher}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </article>

          <aside
            className="flex flex-col gap-6 lg:sticky lg:top-[calc(var(--site-header-height,4.5rem)+1rem)]"
            aria-label={place.name}
          >
            <section className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    href={placePath}
                    className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {t('liveWeather', { place: place.name })}
                  </Link>
                </li>
                <li>
                  <Link
                    href={thingsAnchor}
                    className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {t('thingsToDo', { place: place.name })}
                  </Link>
                </li>
              </ul>
            </section>

            <section className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t('generatedDisclaimer')}
              </p>
            </section>
          </aside>
        </div>
      </PageSection>

      <PageSection className="border-b-0 bg-[#f7f7f7] dark:bg-background">
        <section aria-labelledby="place-guide-related">
          <h2
            id="place-guide-related"
            className={cn(TYPOGRAPHY.heading, 'mb-5 text-2xl')}
          >
            {t('relatedTitle', { place: place.name })}
          </h2>
          <ul className="divide-y divide-border/60 border-y border-border/60">
            <li className="py-3">
              <Link
                href={placePath}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {t('liveWeather', { place: place.name })}
              </Link>
            </li>
            <li className="py-3">
              <Link
                href={thingsAnchor}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {tThings('title', { place: place.name })}
              </Link>
            </li>
            {relatedArticles.map((related) => (
              <li key={related.id || related.slug} className="py-3">
                <Link
                  href={related.href}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {related.title}
                </Link>
                {related.category || related.dateLabel ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[related.category, related.dateLabel].filter(Boolean).join(' · ')}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </PageSection>
    </>
  );
}
