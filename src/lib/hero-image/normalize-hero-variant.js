/**
 * Normalize a provider-specific hero variant to the shared cache/API shape.
 * `unsplashUrl` remains an alias of `sourceUrl` for existing callers.
 *
 * @param {{
 *   imageUrl: string,
 *   blurHash?: string | null,
 *   photographer?: string | null,
 *   photographerUrl?: string | null,
 *   sourceUrl?: string | null,
 *   unsplashUrl?: string | null,
 *   sourceName: string,
 *   queryUsed?: string | null,
 * } | null | undefined} variant
 */
export function normalizeHeroVariant(variant) {
  if (!variant?.imageUrl || !variant?.sourceName) {
    return null;
  }

  const sourceUrl = variant.sourceUrl ?? variant.unsplashUrl ?? null;

  return {
    imageUrl: variant.imageUrl,
    blurHash: variant.blurHash ?? null,
    photographer: variant.photographer ?? null,
    photographerUrl: variant.photographerUrl ?? null,
    sourceUrl,
    sourceName: variant.sourceName,
    unsplashUrl: sourceUrl,
    queryUsed: variant.queryUsed ?? null,
  };
}

/**
 * @param {{
 *   landscape?: object | null,
 *   portrait?: object | null,
 *   photographer?: string | null,
 *   photographerUrl?: string | null,
 *   unsplashUrl?: string | null,
 *   sourceUrl?: string | null,
 *   sourceName?: string | null,
 * } | null} image
 * @param {string} [defaultSourceName]
 */
export function normalizeHeroImage(image, defaultSourceName) {
  if (!image) {
    return null;
  }

  const landscape = normalizeHeroVariant(
    image.landscape
      ? {
          ...image.landscape,
          sourceName: image.landscape.sourceName ?? defaultSourceName,
        }
      : null,
  );
  const portrait = normalizeHeroVariant(
    image.portrait
      ? {
          ...image.portrait,
          sourceName: image.portrait.sourceName ?? defaultSourceName,
        }
      : null,
  );

  if (!landscape && !portrait) {
    return null;
  }

  const primary = landscape ?? portrait;

  return {
    landscape,
    portrait,
    photographer: image.photographer ?? primary?.photographer ?? null,
    photographerUrl: image.photographerUrl ?? primary?.photographerUrl ?? null,
    sourceUrl: image.sourceUrl ?? image.unsplashUrl ?? primary?.sourceUrl ?? null,
    sourceName: image.sourceName ?? primary?.sourceName ?? defaultSourceName ?? null,
    unsplashUrl: image.unsplashUrl ?? image.sourceUrl ?? primary?.unsplashUrl ?? null,
  };
}
