import Image from 'next/image';

/**
 * @typedef {{
 *   imageUrl: string;
 *   blurHash?: string | null;
 *   photographer?: string | null;
 *   photographerUrl?: string | null;
 *   unsplashUrl?: string | null;
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
 *   } | null;
 * }} props
 */
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
 *   unsplashUrl?: string | null;
 * }} credit
 */
function AttributionCredit({ photographer, photographerUrl, unsplashUrl }) {
  if (!photographer || !unsplashUrl) {
    return null;
  }

  return (
    <>
      Photo by{' '}
      {photographerUrl ? (
        <a href={photographerUrl}>{photographer}</a>
      ) : (
        photographer
      )}{' '}
      on{' '}
      <a href={`${unsplashUrl}?utm_source=meridian_weather&utm_medium=referral`}>
        Unsplash
      </a>
    </>
  );
}

/**
 * @param {{
 *   heroImage?: {
 *     landscape?: HeroVariant | null;
 *     portrait?: HeroVariant | null;
 *     photographer?: string | null;
 *     photographerUrl?: string | null;
 *     unsplashUrl?: string | null;
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
    && landscape.unsplashUrl === portrait.unsplashUrl,
  );

  if (sameCredit || (!landscape?.photographer && !portrait?.photographer)) {
    const credit = landscape ?? portrait ?? heroImage;
    if (!credit?.photographer || !credit?.unsplashUrl) {
      return null;
    }

    return (
      <p className="sr-only">
        <AttributionCredit
          photographer={credit.photographer}
          photographerUrl={credit.photographerUrl}
          unsplashUrl={credit.unsplashUrl}
        />
      </p>
    );
  }

  return (
    <p className="sr-only">
      {portrait?.photographer && portrait?.unsplashUrl ? (
        <>
          Mobile:{' '}
          <AttributionCredit
            photographer={portrait.photographer}
            photographerUrl={portrait.photographerUrl}
            unsplashUrl={portrait.unsplashUrl}
          />
          {landscape?.photographer && landscape?.unsplashUrl ? '. ' : null}
        </>
      ) : null}
      {landscape?.photographer && landscape?.unsplashUrl ? (
        <>
          Desktop:{' '}
          <AttributionCredit
            photographer={landscape.photographer}
            photographerUrl={landscape.photographerUrl}
            unsplashUrl={landscape.unsplashUrl}
          />
        </>
      ) : null}
    </p>
  );
}
