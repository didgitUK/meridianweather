/**
 * @param {{
 *   landscapeUrl?: string | null;
 *   portraitUrl?: string | null;
 * }} props
 */
export function HeroImagePreload({ landscapeUrl = null, portraitUrl = null }) {
  return (
    <>
      {portraitUrl ? (
        <link rel="preload" as="image" href={portraitUrl} media="(max-width: 639px)" />
      ) : null}
      {landscapeUrl ? (
        <link
          rel="preload"
          as="image"
          href={landscapeUrl}
          media={portraitUrl ? '(min-width: 640px)' : undefined}
        />
      ) : null}
    </>
  );
}
