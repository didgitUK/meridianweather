import {
  PLACE_GUIDE_PROMPT_VERSION,
  PLACE_GUIDE_STALE_MS,
  PLACE_LOCAL_LINKS_MAX,
  PLACE_LOCAL_LINKS_STALE_MS,
} from '@/constants/place-content';
import { PLACE_ARTICLE_STATUS } from '@/constants/place-content';
import { buildPlaceContextPack } from '@/lib/places/build-place-context-pack';
import { ensurePlacePois } from '@/lib/places/fetch-place-pois';
import { generatePlaceGuideWithLlm } from '@/lib/places/llm-generate-place-guide';
import {
  canSpendLlmGeneration,
  insertPlaceContentRun,
  recordLlmGeneration,
} from '@/lib/places/place-content-budget';
import {
  getLatestPlaceArticle,
  upsertPlaceArticle,
} from '@/lib/places/place-articles-repo';
import {
  getPlaceLocalLinksFetchedAt,
  replacePlaceLocalLinks,
} from '@/lib/places/place-local-links-repo';
import { validatePlaceArticle, countWordsFromHtml } from '@/lib/places/validate-place-article';

/**
 * Fetch outbound local headlines when PLACE_CONTENT_NEWS_RSS_URL is set.
 * Stores title/url/publisher only — never article bodies.
 * @param {{
 *   slug: string,
 *   name: string,
 *   force?: boolean,
 *   fetchImpl?: typeof fetch,
 * }} place
 */
export async function ensurePlaceLocalLinks(place) {
  const feedUrl = process.env.PLACE_CONTENT_NEWS_RSS_URL;
  if (!feedUrl) {
    return { links: [], refreshed: false, skipped: true, reason: 'no_feed' };
  }

  const fetchedAt = getPlaceLocalLinksFetchedAt(place.slug);
  const ageMs = fetchedAt ? Date.now() - Date.parse(fetchedAt) : Number.POSITIVE_INFINITY;
  if (!place.force && fetchedAt && ageMs < PLACE_LOCAL_LINKS_STALE_MS) {
    return { links: [], refreshed: false, skipped: false, reason: 'fresh' };
  }

  const fetchImpl = place.fetchImpl ?? fetch;
  const url = feedUrl
    .replaceAll('{place}', encodeURIComponent(place.name))
    .replaceAll('{slug}', encodeURIComponent(place.slug));

  let response;
  try {
    response = await fetchImpl(url, {
      headers: { Accept: 'application/rss+xml, application/xml, text/xml, application/json' },
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    return { links: [], refreshed: false, skipped: true, reason: error.message };
  }

  if (!response.ok) {
    return { links: [], refreshed: false, skipped: true, reason: `http_${response.status}` };
  }

  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();
  const links = contentType.includes('json')
    ? parseNewsJson(text, place.name)
    : parseRssItems(text);

  const stored = replacePlaceLocalLinks(place.slug, links.slice(0, PLACE_LOCAL_LINKS_MAX));
  return { links: stored, refreshed: true, skipped: false };
}

/**
 * @param {string} xml
 */
export function parseRssItems(xml) {
  const items = [];
  const itemMatches = String(xml).matchAll(/<item[\s\S]*?<\/item>/gi);
  for (const match of itemMatches) {
    const block = match[0];
    const title = decodeXml(pickTag(block, 'title'));
    const link = decodeXml(pickTag(block, 'link') || pickTag(block, 'guid'));
    const pubDate = pickTag(block, 'pubDate');
    const source = decodeXml(pickTag(block, 'source')) || null;
    if (!title || !link || !/^https?:\/\//i.test(link)) {
      continue;
    }
    items.push({
      title,
      url: link,
      publisher: source,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : null,
    });
  }
  return items;
}

function parseNewsJson(text, placeName) {
  try {
    const payload = JSON.parse(text);
    const articles = payload.articles || payload.items || payload.results || [];
    return articles
      .map((article) => ({
        title: article.title || article.headline,
        url: article.url || article.link,
        publisher: article.source?.name || article.publisher || null,
        publishedAt: article.publishedAt || article.pubDate || null,
      }))
      .filter((item) => item.title && item.url && /^https?:\/\//i.test(item.url))
      .filter((item) =>
        !placeName
        || String(item.title).toLowerCase().includes(String(placeName).toLowerCase()),
      );
  } catch {
    return [];
  }
}

function pickTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
    || block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match?.[1]?.trim() ?? '';
}

function decodeXml(value) {
  return String(value ?? '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * @param {{
 *   place: {
 *     slug: string,
 *     name: string,
 *     lat: number,
 *     lon: number,
 *     adminArea?: string | null,
 *     state?: string | null,
 *     country?: string | null,
 *     population?: number,
 *     placeType?: string,
 *   },
 *   weather?: unknown,
 *   force?: boolean,
 *   fetchImpl?: typeof fetch,
 * }} input
 */
export async function runPlaceContentPipeline(input) {
  const place = input.place;
  const started = Date.now();

  const poisResult = await ensurePlacePois({
    slug: place.slug,
    lat: place.lat,
    lon: place.lon,
    force: input.force,
    fetchImpl: input.fetchImpl,
  }).catch((error) => ({
    pois: [],
    refreshed: false,
    skipped: true,
    reason: error.message,
  }));

  await ensurePlaceLocalLinks({
    slug: place.slug,
    name: place.name,
    force: input.force,
    fetchImpl: input.fetchImpl,
  });

  const latest = getLatestPlaceArticle(place.slug);
  if (
    !input.force
    && latest
    && latest.status === PLACE_ARTICLE_STATUS.published
    && latest.generatedAt
    && Date.now() - Date.parse(latest.generatedAt) < PLACE_GUIDE_STALE_MS
  ) {
    return {
      ok: true,
      skipped: true,
      reason: 'guide_fresh',
      pois: poisResult,
      article: latest,
      durationMs: Date.now() - started,
    };
  }

  if (latest?.lockedByAdmin && !input.force) {
    return {
      ok: true,
      skipped: true,
      reason: 'locked_by_admin',
      article: latest,
      pois: poisResult,
      durationMs: Date.now() - started,
    };
  }

  if (!canSpendLlmGeneration()) {
    return {
      ok: false,
      skipped: true,
      reason: 'llm_budget',
      pois: poisResult,
      durationMs: Date.now() - started,
    };
  }

  const pack = await buildPlaceContextPack({
    place,
    weather: input.weather,
    fetchImpl: input.fetchImpl,
  });

  let draft;
  try {
    draft = await generatePlaceGuideWithLlm(pack, { fetchImpl: input.fetchImpl });
    recordLlmGeneration();
  } catch (error) {
    insertPlaceContentRun({
      placeSlug: place.slug,
      job: 'place-guide',
      status: 'error',
      promptVersion: PLACE_GUIDE_PROMPT_VERSION,
      errorSummary: error.message,
      meta: { code: error.code ?? 'llm_error' },
    });

    upsertPlaceArticle({
      placeSlug: place.slug,
      slug: 'weather-weekend-planner',
      title: `${place.name} weather guide (pending)`,
      excerpt: 'Guide generation failed; will retry on the next content cron.',
      category: pack.guideCategory,
      bodyHtml: '<p>Generation failed.</p>',
      wordCount: 2,
      status: PLACE_ARTICLE_STATUS.failed,
      sources: pack.sources,
      model: null,
      promptVersion: PLACE_GUIDE_PROMPT_VERSION,
      contextHash: pack.contextHash,
    });

    return {
      ok: false,
      skipped: false,
      reason: error.message,
      pois: poisResult,
      durationMs: Date.now() - started,
    };
  }

  const validation = validatePlaceArticle({
    title: draft.title,
    excerpt: draft.excerpt,
    bodyHtml: draft.bodyHtml,
    sources: draft.sources,
    imageUrl: draft.imageUrl,
    imageCredit: draft.imageCredit,
    imageSourceUrl: draft.imageSourceUrl,
    placeSlug: place.slug,
    placeName: place.name,
    wikipediaExtract: pack.wikipedia?.extract,
  });

  const status = validation.ok
    ? PLACE_ARTICLE_STATUS.published
    : PLACE_ARTICLE_STATUS.draft;

  const article = upsertPlaceArticle({
    placeSlug: place.slug,
    slug: draft.slug,
    title: draft.title || `${place.name} weather planner`,
    excerpt: draft.excerpt || `Plan a visit to ${place.name} with Meridian weather.`,
    category: draft.category,
    bodyHtml: draft.bodyHtml,
    wordCount: validation.wordCount || countWordsFromHtml(draft.bodyHtml),
    status,
    sources: draft.sources,
    imageUrl: draft.imageUrl,
    imageCredit: draft.imageCredit,
    imageSourceUrl: draft.imageSourceUrl,
    model: draft.model,
    promptVersion: draft.promptVersion,
    contextHash: pack.contextHash,
  });

  insertPlaceContentRun({
    placeSlug: place.slug,
    job: 'place-guide',
    status: validation.ok ? 'ok' : 'partial',
    model: draft.model,
    promptVersion: draft.promptVersion,
    tokensIn: draft.usage?.tokensIn,
    tokensOut: draft.usage?.tokensOut,
    errorSummary: validation.ok ? null : validation.errors.join(','),
    meta: { mode: draft.mode, errors: validation.errors },
  });

  return {
    ok: validation.ok,
    skipped: false,
    reason: validation.ok ? 'published' : 'draft_validation_failed',
    validation,
    article,
    pois: poisResult,
    durationMs: Date.now() - started,
  };
}
