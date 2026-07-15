'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { TYPOGRAPHY } from '@/constants/design-tokens';
import { cn } from '@/lib/utils';

export function BlogArticleCard({ post, className }) {
  return (
    <article className={cn('min-w-0', className)}>
      <Link
        href={post.href}
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card transition-colors hover:border-border hover:bg-muted/20"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={post.imageUrl}
            alt={post.imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            unoptimized
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
            <span>{post.category}</span>
            <span aria-hidden>·</span>
            <time dateTime={post.dateIso ?? post.dateLabel}>{post.dateLabel}</time>
          </div>
          <h3 className={cn(TYPOGRAPHY.heading, 'text-lg leading-snug text-foreground')}>
            {post.title}
          </h3>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
          <span className="mt-auto pt-2 text-sm font-medium text-foreground underline-offset-4 group-hover:underline">
            Read article
          </span>
        </div>
      </Link>
    </article>
  );
}
