import Image from 'next/image';
import { getHeroSourceLabel } from '@/constants/hero-sources';

/**
 * @typedef {{
 *   imageUrl: string;
 *   blurHash?: string | null;
 *   photographer?: string | null;
 *   photographerUrl?: string | null;
 *   unsplashUrl?: string | null;
 *   sourceUrl?: string | null;
 *   sourceName?: string | null;
 * }} HeroVariant
 */

/**
 * @param {{
 *   heroImage?: {
 *     landscape?: HeroVariant | null;
 *     portrait?: HeroVariant | null;
 *     photographer?: string | null;
 *     photographerUrl?: string | null;
 *     unsplashUrl?: string | null;
 *     sourceUrl?: string | null;
 *     sourceName?: string | null;
 *   } | null;
 * }} props
 */
function heroImageNeedsUnoptimized(src) {
  return typeof src === 'string' && (src.endsWith('.svg') || src.startsWith('/hero/'));
}

export function DashboardHeroBackdrop({ heroImage = null }) {
  const landscape = heroImage?.landscape ?? null;
  const portrait = heroImage?.portrait ?? null;
  const hasPhoto = Boolean(landscape?.imageUrl || portrait?.imageUrl);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {hasPhoto ? (
        <>
          <div className="dashboard-hero__photo-wrap absolute -inset-10">
            {portrait?.imageUrl ? (
              <Image
                src={portrait.imageUrl}
                alt=""
                fill
                priority
                sizes="100vw"
                unoptimized={heroImageNeedsUnoptimized(portrait.imageUrl)}
                className="dashboard-hero__photo object-cover sm:hidden"
              />
            ) : null}
            {landscape?.imageUrl ? (
              <Image
                src={landscape.imageUrl}
                alt=""
                fill
                priority
                sizes="100vw"
                unoptimized={heroImageNeedsUnoptimized(landscape.imageUrl)}
                className={
                  portrait?.imageUrl
                    ? 'dashboard-hero__photo hidden object-cover sm:block'
                    : 'dashboard-hero__photo object-cover'
                }
              />
            ) : portrait?.imageUrl ? (
              <Image
                src={portrait.imageUrl}
                alt=""
                fill
                priority
                sizes="100vw"
                unoptimized={heroImageNeedsUnoptimized(portrait.imageUrl)}
                className="dashboard-hero__photo hidden object-cover sm:block"
              />
            ) : null}
          </div>
          <div className="dashboard-hero__photo-scrim absolute inset-0" />
        </>
      ) : (
        <div className="dashboard-hero__sky absolute inset-0" />
      )}
      <div className="dashboard-hero__dots absolute inset-0 opacity-70" />
      <div className="dashboard-hero__meridians absolute inset-0" />
      <div className="hero-glow-primary absolute -top-20 right-[8%] size-[min(36rem,70vw)] rounded-full bg-[var(--hero-glow-primary)] blur-3xl" />
      <div className="hero-glow-secondary absolute -bottom-24 left-[6%] size-[min(28rem,55vw)] rounded-full bg-[var(--hero-glow-secondary)] blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-border/50" />
    </div>
  );
}

/**
 * @param {{
 *   photographer?: string | null;
 *   photographerUrl?: string | null;
 *   sourceUrl?: string | null;
 *   unsplashUrl?: string | null;
 *   sourceName?: string | null;
 * }} credit
 */
function AttributionCredit({ photographer, photographerUrl, sourceUrl, unsplashUrl, sourceName }) {
  const href = sourceUrl ?? unsplashUrl;
  if (!photographer || !href) {
    return null;
  }

  const label = getHeroSourceLabel(sourceName);
  const creditHref = href.includes('?')
    ? `${href}&utm_source=meridian_weather&utm_medium=referral`
    : `${href}?utm_source=meridian_weather&utm_medium=referral`;

  return (
    <>
      Photo by{' '}
      {photographerUrl ? (
        <a href={photographerUrl}>{photographer}</a>
      ) : (
        photographer
      )}{' '}
      on{' '}
      <a href={creditHref}>
        {label}
      </a>
    </>
  );
}

function creditSourceUrl(credit) {
  return credit?.sourceUrl ?? credit?.unsplashUrl ?? null;
}

/**
 * @param {{
 *   heroImage?: {
 *     landscape?: HeroVariant | null;
 *     portrait?: HeroVariant | null;
 *     photographer?: string | null;
 *     photographerUrl?: string | null;
 *     unsplashUrl?: string | null;
 *     sourceUrl?: string | null;
 *     sourceName?: string | null;
 *   } | null;
 * }} props
 */
export function DashboardHeroAttribution({ heroImage = null }) {
  const landscape = heroImage?.landscape ?? null;
  const portrait = heroImage?.portrait ?? null;
  const sameCredit = Boolean(
    landscape?.photographer
    && portrait?.photographer
    && landscape.photographer === portrait.photographer
    && creditSourceUrl(landscape) === creditSourceUrl(portrait),
  );

  if (sameCredit || (!landscape?.photographer && !portrait?.photographer)) {
    const credit = landscape ?? portrait ?? heroImage;
    if (!credit?.photographer || !creditSourceUrl(credit)) {
      return null;
    }

    return (
      <p className="sr-only">
        <AttributionCredit
          photographer={credit.photographer}
          photographerUrl={credit.photographerUrl}
          sourceUrl={creditSourceUrl(credit)}
          sourceName={credit.sourceName}
        />
      </p>
    );
  }

  return (
    <p className="sr-only">
      {portrait?.photographer && creditSourceUrl(portrait) ? (
        <>
          Mobile:{' '}
          <AttributionCredit
            photographer={portrait.photographer}
            photographerUrl={portrait.photographerUrl}
            sourceUrl={creditSourceUrl(portrait)}
            sourceName={portrait.sourceName}
          />
          {landscape?.photographer && creditSourceUrl(landscape) ? '. ' : null}
        </>
      ) : null}
      {landscape?.photographer && creditSourceUrl(landscape) ? (
        <>
          Desktop:{' '}
          <AttributionCredit
            photographer={landscape.photographer}
            photographerUrl={landscape.photographerUrl}
            sourceUrl={creditSourceUrl(landscape)}
            sourceName={landscape.sourceName}
          />
        </>
      ) : null}
    </p>
  );
}
