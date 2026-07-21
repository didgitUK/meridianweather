import {
  PLACE_GUIDE_MIN_SOURCES,
  PLACE_GUIDE_MIN_WORDS,
  PLACE_GUIDE_REQUIRED_H2,
} from '@/constants/place-content';

/**
 * @param {string} html
 */
export function countWordsFromHtml(html) {
  const text = String(html ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) {
    return 0;
  }

  return text.split(' ').filter(Boolean).length;
}

/**
 * @param {string} html
 */
export function extractH2Texts(html) {
  const matches = String(html ?? '').matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi);
  return [...matches].map((match) =>
    match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
  );
}

/**
 * Rough check that body is not a near-verbatim paste of a source extract.
 * @param {string} bodyHtml
 * @param {string | null | undefined} sourceText
 */
export function looksLikeSourcePaste(bodyHtml, sourceText) {
  if (!sourceText || sourceText.length < 120) {
    return false;
  }

  const body = String(bodyHtml ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();
  const needle = sourceText.slice(0, 160).toLowerCase().replace(/\s+/g, ' ').trim();
  if (needle.length < 80) {
    return false;
  }

  return body.includes(needle);
}

/**
 * @param {{
 *   title?: string,
 *   excerpt?: string,
 *   bodyHtml?: string,
 *   sources?: Array<{ url?: string }>,
 *   imageUrl?: string | null,
 *   imageCredit?: string | null,
 *   imageSourceUrl?: string | null,
 *   placeSlug?: string,
 *   placeName?: string,
 *   wikipediaExtract?: string | null,
 * }} article
 */
export function validatePlaceArticle(article) {
  const errors = [];
  const bodyHtml = String(article.bodyHtml ?? '');
  const wordCount = countWordsFromHtml(bodyHtml);

  if (wordCount < PLACE_GUIDE_MIN_WORDS) {
    errors.push(`word_count:${wordCount}<${PLACE_GUIDE_MIN_WORDS}`);
  }

  const h2s = extractH2Texts(bodyHtml);
  for (const required of PLACE_GUIDE_REQUIRED_H2) {
    const found = h2s.some(
      (heading) => heading.toLowerCase() === required.toLowerCase(),
    );
    if (!found) {
      errors.push(`missing_h2:${required}`);
    }
  }

  const sources = Array.isArray(article.sources) ? article.sources : [];
  const urls = new Set(
    sources
      .map((source) => String(source?.url ?? '').trim())
      .filter(Boolean),
  );
  if (urls.size < PLACE_GUIDE_MIN_SOURCES) {
    errors.push(`sources:${urls.size}<${PLACE_GUIDE_MIN_SOURCES}`);
  }

  if (!article.imageUrl || !article.imageCredit || !article.imageSourceUrl) {
    errors.push('image_credit_incomplete');
  }

  const placeName = String(article.placeName ?? '').trim();
  if (placeName && !bodyHtml.toLowerCase().includes(placeName.toLowerCase())) {
    errors.push('missing_place_name');
  }

  const placeSlug = String(article.placeSlug ?? '').trim();
  if (placeSlug && !bodyHtml.includes(`/weather/${placeSlug}`)) {
    errors.push('missing_internal_weather_link');
  }

  if (looksLikeSourcePaste(bodyHtml, article.wikipediaExtract)) {
    errors.push('possible_source_paste');
  }

  return {
    ok: errors.length === 0,
    errors,
    wordCount,
    h2s,
  };
}
