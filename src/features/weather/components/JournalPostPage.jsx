import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { CmsBody } from '@/components/cms/CmsBody';
import { PageSection } from '@/components/layout/PageSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { BlogArticleCard } from '@/features/weather/components/BlogArticleCard';
import { JournalPostSidebar } from '@/features/weather/components/JournalPostSidebar';
import { getDocsPages } from '@/content/docs';
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';
import { buildArticleSchema, buildBreadcrumbSchema } from '@/lib/seo';
import { cn } from '@/lib/utils';

const CATEGORY_DOC_SLUGS = Object.freeze({
  Guides: ['getting-started', 'forecasts'],
  Forecasts: ['forecasts', 'city-detail'],
  Product: ['dashboard', 'getting-started'],
  Alerts: ['subscriptions', 'monetization'],
});

function buildSchemaLinks(post, docsPages, t) {
  const preferred = CATEGORY_DOC_SLUGS[post.category] ?? ['getting-started', 'dashboard'];
  const docsBySlug = new Map(docsPages.map((page) => [page.slug, page]));
  const docLinks = preferred
    .map((slug) => docsBySlug.get(slug))
    .filter(Boolean)
    .map((page) => ({
      href: `/docs/${page.slug}`,
      label: page.title,
    }));

  return [
    { href: '/journal', label: t('schemaJournal') },
    { href: '/docs', label: t('schemaDocs') },
    ...docLinks,
    { href: '/legal/privacy', label: t('schemaPrivacy') },
  ];
}

function JournalPostTitleHero({ post, backLinkLabel }) {
  return (
    <header className="relative isolate w-full overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 z-0" aria-hidden>
        <Image
          src={post.imageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          unoptimized
        />
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
              href="/journal"
              className="underline-offset-4 hover:text-white hover:underline"
            >
              {backLinkLabel}
            </Link>
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-white/75">
            <span>{post.category}</span>
            <span aria-hidden>·</span>
            <time dateTime={post.dateIso ?? post.dateLabel}>{post.dateLabel}</time>
          </div>
          <h1
            className={cn(
              TYPOGRAPHY.displaySm,
              TYPOGRAPHY.heading,
              'text-balance text-white',
            )}
          >
            {post.title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            {post.excerpt}
          </p>
        </div>
      </div>
    </header>
  );
}

export async function JournalPostPage({ post, relatedPosts = [], locale = 'en' }) {
  const t = await getTranslations('Journal.archive');
  const tPost = await getTranslations('Journal.post');
  const docsPages = getDocsPages(locale);
  const schemaLinks = buildSchemaLinks(post, docsPages, tPost);
  const breadcrumbItems = [
    { name: t('title'), path: '/journal' },
    { name: post.title, path: post.href },
  ];

  return (
    <>
      <JsonLd
        data={buildArticleSchema({
          title: post.title,
          description: post.excerpt,
          path: post.href,
          dateIso: post.dateIso,
          imageUrl: post.imageUrl,
          category: post.category,
        })}
      />
      <JsonLd data={buildBreadcrumbSchema(breadcrumbItems)} />

      <JournalPostTitleHero post={post} backLinkLabel={t('backLink')} />

      <PageSection>
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-12">
          <div className="flex min-w-0 flex-col gap-10">
            <article className={cn('flex w-full flex-col', SPACING.stack6)}>
              <CmsBody
                html={post.bodyHtml}
                paragraphs={post.body}
                className="flex flex-col gap-5 text-base leading-relaxed text-foreground/90 [&_a]:text-primary [&_a]:underline [&_h2]:font-heading [&_h2]:text-2xl [&_h3]:font-heading [&_h3]:text-xl [&_li]:ms-5 [&_ol]:list-decimal [&_ul]:list-disc"
              />
            </article>
          </div>

          <JournalPostSidebar schemaLinks={schemaLinks} />
        </div>
      </PageSection>

      {relatedPosts.length > 0 ? (
        <PageSection className="border-b-0" tone="muted">
          <section
            id="other-posts"
            aria-labelledby="journal-other-posts-title"
            className="scroll-mt-[calc(var(--site-header-height,4.5rem)+1rem)]"
          >
            <h2
              id="journal-other-posts-title"
              className={cn(TYPOGRAPHY.heading, 'mb-5 text-2xl')}
            >
              {tPost('otherPostsTitle')}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedPosts.map((related) => (
                <BlogArticleCard key={related.id} post={related} />
              ))}
            </div>
          </section>
        </PageSection>
      ) : null}
    </>
  );
}
