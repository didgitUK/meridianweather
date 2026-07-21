import { stripWikiHtml } from '@/lib/hero-image/wikimedia-resolver';

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

/**
 * @param {{ name: string, adminArea?: string | null, country?: string | null, fetchImpl?: typeof fetch }} place
 */
export async function fetchWikipediaPlaceAbstract(place) {
  const fetchImpl = place.fetchImpl ?? fetch;
  const titles = [
    place.name,
    place.adminArea ? `${place.name}, ${place.adminArea}` : null,
    place.country === 'GB' ? `${place.name}, England` : null,
    place.country === 'GB' ? `${place.name}, United Kingdom` : null,
  ].filter(Boolean);

  for (const title of titles) {
    const url = new URL(WIKI_API);
    url.searchParams.set('action', 'query');
    url.searchParams.set('format', 'json');
    url.searchParams.set('origin', '*');
    url.searchParams.set('prop', 'extracts|info');
    url.searchParams.set('exintro', '1');
    url.searchParams.set('explaintext', '1');
    url.searchParams.set('redirects', '1');
    url.searchParams.set('inprop', 'url');
    url.searchParams.set('titles', title);

    let response;
    try {
      response = await fetchImpl(url.toString(), {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(12_000),
      });
    } catch {
      continue;
    }

    if (!response.ok) {
      continue;
    }

    const payload = await response.json();
    const pages = payload?.query?.pages;
    if (!pages || typeof pages !== 'object') {
      continue;
    }

    const page = Object.values(pages).find(
      (entry) => entry && !entry.missing && entry.extract,
    );
    if (!page) {
      continue;
    }

    const extract = String(page.extract ?? '').trim();
    if (extract.length < 80) {
      continue;
    }

    return {
      title: page.title ?? title,
      extract: extract.slice(0, 1200),
      url: page.fullurl
        || `https://en.wikipedia.org/wiki/${encodeURIComponent(String(page.title ?? title).replace(/ /g, '_'))}`,
      source: 'Wikipedia',
    };
  }

  return null;
}

/**
 * Lightweight Wikidata-style fact line from Wikipedia page summary only.
 * @param {string | null | undefined} html
 */
export function sanitizeWikiExtract(html) {
  return stripWikiHtml(html);
}
