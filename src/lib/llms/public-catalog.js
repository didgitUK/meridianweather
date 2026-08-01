import { BRAND } from '@/constants/brand';
import { HOME_BLOG_POSTS } from '@/constants/blog-posts-defaults';
import { PLACE_EDITORIAL_BLURBS } from '@/constants/place-editorial-blurbs';
import { DOCS_PAGE_DEFAULTS } from '@/content/docs';
import { LEGAL_POLICY_DEFAULTS } from '@/content/legal';
import { DOCS_NOINDEX_SLUGS, isDocsNoindexSlug } from '@/lib/seo-indexability';
import { absoluteUrl } from '@/lib/seo';

/** Docs that stay out of GEO (operator / API runbooks). */
export const LLMS_EXCLUDED_DOC_SLUGS = Object.freeze([...DOCS_NOINDEX_SLUGS]);

/** Featured journal posts for the compact /llms.txt index. */
export const LLMS_FEATURED_JOURNAL_IDS = Object.freeze([
  'reading-hourly-forecasts',
  'ten-day-outlook',
  'pinning-locations',
  'free-tier-honesty',
  'consent-and-ads',
  'using-place-pages',
  'install-pwa',
]);

/** Featured place blurbs for the compact index (full set still has microfiles). */
export const LLMS_FEATURED_PLACE_SLUGS = Object.freeze([
  'london',
  'birmingham',
  'manchester',
  'glasgow',
  'edinburgh',
  'cardiff',
  'belfast',
  'bristol',
  'leeds',
  'liverpool',
]);

/**
 * @param {{ id?: string | null, title?: string | null }} section
 */
export function isPublicContentSection(section) {
  const id = String(section?.id ?? '').toLowerCase();
  const title = String(section?.title ?? '').toLowerCase();
  if (id === 'operators' || id.startsWith('operator')) {
    return false;
  }
  if (title.includes('for site operators') || title.includes('for operators')) {
    return false;
  }
  return true;
}

/**
 * @returns {Array<{
 *   key: string,
 *   llmsPath: string,
 *   sitePath: string,
 *   title: string,
 *   description: string,
 *   section: 'Core' | 'Documentation' | 'Journal' | 'Legal' | 'Places' | 'Optional',
 *   index: boolean,
 *   kind: string,
 *   slug?: string,
 * }>}
 */
export function listLlmsPublicPages() {
  const pages = [
    {
      key: 'home',
      llmsPath: 'home.txt',
      sitePath: '/',
      title: `${BRAND.name} home`,
      description:
        'Multi-city weather dashboard, search, pins, and installable PWA overview.',
      section: 'Core',
      index: true,
      kind: 'home',
    },
    {
      key: 'about',
      llmsPath: 'about.txt',
      sitePath: '/about',
      title: 'About meridian',
      description: 'Who runs meridian, data sources, consent, and ads.',
      section: 'Core',
      index: true,
      kind: 'about',
    },
    {
      key: 'faq',
      llmsPath: 'faq.txt',
      sitePath: '/faq',
      title: 'FAQ',
      description: 'Forecasts, coverage, consent, alerts, and place pages.',
      section: 'Core',
      index: true,
      kind: 'faq',
    },
    {
      key: 'search',
      llmsPath: 'search.txt',
      sitePath: '/search',
      title: 'Search',
      description: 'Worldwide location search for city and place forecasts.',
      section: 'Core',
      index: true,
      kind: 'search',
    },
    {
      key: 'journal',
      llmsPath: 'journal.txt',
      sitePath: '/journal',
      title: 'Journal archive',
      description: 'Original forecast-reading and product guidance articles.',
      section: 'Core',
      index: true,
      kind: 'journal-index',
    },
    {
      key: 'docs',
      llmsPath: 'docs.txt',
      sitePath: '/docs',
      title: 'Documentation hub',
      description: 'Visitor-facing product guides (no operator API runbooks).',
      section: 'Documentation',
      index: true,
      kind: 'docs-index',
    },
  ];

  for (const doc of DOCS_PAGE_DEFAULTS) {
    if (isDocsNoindexSlug(doc.slug) || LLMS_EXCLUDED_DOC_SLUGS.includes(doc.slug)) {
      continue;
    }
    pages.push({
      key: `docs/${doc.slug}`,
      llmsPath: `docs/${doc.slug}.txt`,
      sitePath: `/docs/${doc.slug}`,
      title: doc.title,
      description: firstSentence(doc.sections?.[0]?.body) || `Product guide: ${doc.title}.`,
      section: 'Documentation',
      index: true,
      kind: 'doc',
      slug: doc.slug,
    });
  }

  for (const post of HOME_BLOG_POSTS) {
    pages.push({
      key: `journal/${post.id}`,
      llmsPath: `journal/${post.id}.txt`,
      sitePath: `/journal/${post.id}`,
      title: post.title,
      description: post.excerpt,
      section: 'Journal',
      index: LLMS_FEATURED_JOURNAL_IDS.includes(post.id),
      kind: 'journal',
      slug: post.id,
    });
  }

  for (const policy of LEGAL_POLICY_DEFAULTS) {
    pages.push({
      key: `legal/${policy.slug}`,
      llmsPath: `legal/${policy.slug}.txt`,
      sitePath: `/legal/${policy.slug}`,
      title: policy.title,
      description: firstSentence(policy.sections?.[0]?.body) || policy.title,
      section: 'Legal',
      index: true,
      kind: 'legal',
      slug: policy.slug,
    });
  }

  for (const [slug, blurb] of Object.entries(PLACE_EDITORIAL_BLURBS)) {
    pages.push({
      key: `weather/${slug}`,
      llmsPath: `weather/${slug}.txt`,
      sitePath: `/weather/${slug}`,
      title: `${titleCaseSlug(slug)} weather`,
      description: firstSentence(blurb) || `Live weather page for ${slug}.`,
      section: 'Places',
      index: LLMS_FEATURED_PLACE_SLUGS.includes(slug),
      kind: 'weather-place',
      slug,
    });
  }

  pages.push(
    {
      key: 'llms-full',
      llmsPath: '../llms-full.txt',
      sitePath: '/llms-full.txt',
      title: 'llms-full.txt',
      description: 'Concatenated public GEO corpus for one-pass ingestion.',
      section: 'Optional',
      index: true,
      kind: 'meta',
    },
    {
      key: 'ai',
      llmsPath: '../ai.txt',
      sitePath: '/ai.txt',
      title: 'ai.txt',
      description: 'Short AI discovery pointer to the llms.txt surface.',
      section: 'Optional',
      index: true,
      kind: 'meta',
    },
    {
      key: 'well-known-llms',
      llmsPath: '../.well-known/llms.txt',
      sitePath: '/.well-known/llms.txt',
      title: '.well-known/llms.txt',
      description: 'Well-known mirror of /llms.txt for agent discovery.',
      section: 'Optional',
      index: true,
      kind: 'meta',
    },
    {
      key: 'sitemap',
      llmsPath: '../sitemap.xml',
      sitePath: '/sitemap.xml',
      title: 'Sitemap',
      description: 'Search-index URL inventory (en / en-GB public pages).',
      section: 'Optional',
      index: true,
      kind: 'meta',
    },
    {
      key: 'robots',
      llmsPath: '../robots.txt',
      sitePath: '/robots.txt',
      title: 'robots.txt',
      description: 'Crawl allow/deny for public pages; admin and API disallowed.',
      section: 'Optional',
      index: true,
      kind: 'meta',
    },
    {
      key: 'ads',
      llmsPath: '../ads.txt',
      sitePath: '/ads.txt',
      title: 'ads.txt',
      description: 'Authorized digital sellers record for advertising.',
      section: 'Optional',
      index: true,
      kind: 'meta',
    },
  );

  return pages;
}

/**
 * @param {string} llmsPath e.g. "about.txt" or "docs/getting-started.txt"
 */
export function findLlmsPageByPath(llmsPath) {
  const normalized = String(llmsPath ?? '')
    .replace(/^\/+/, '')
    .replace(/^llms\//, '');
  const withTxt = normalized.endsWith('.txt') ? normalized : `${normalized}.txt`;
  return listLlmsPublicPages().find((page) => page.llmsPath === withTxt) ?? null;
}

export function llmsAbsoluteUrl(path) {
  return absoluteUrl(path);
}

function firstSentence(text) {
  const trimmed = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (!trimmed) {
    return '';
  }
  const match = trimmed.match(/^(.+?[.!?])(?:\s|$)/);
  const sentence = (match?.[1] ?? trimmed).slice(0, 180);
  return sentence.endsWith('.') || sentence.endsWith('!') || sentence.endsWith('?')
    ? sentence
    : `${sentence}${trimmed.length > sentence.length ? '…' : ''}`;
}

function titleCaseSlug(slug) {
  return String(slug)
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
