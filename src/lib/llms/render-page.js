import { BRAND, LEGAL_ENTITY } from '@/constants/brand';
import { HOME_BLOG_POSTS } from '@/constants/blog-posts-defaults';
import { PLACE_EDITORIAL_BLURBS } from '@/constants/place-editorial-blurbs';
import { DOCS_PAGE_DEFAULTS } from '@/content/docs';
import { LEGAL_POLICY_DEFAULTS } from '@/content/legal';
import {
  isPublicContentSection,
  llmsAbsoluteUrl,
  listLlmsPublicPages,
} from '@/lib/llms/public-catalog';
import enMessages from '../../../messages/en.json';

/**
 * @param {{ title: string, sitePath: string, sections?: Array<{ title: string, body: string, id?: string }> }} page
 */
function renderSectionsDocument(page) {
  const lines = [
    `# ${page.title}`,
    '',
    `Canonical page: ${llmsAbsoluteUrl(page.sitePath)}`,
    '',
  ];

  for (const section of page.sections ?? []) {
    if (!isPublicContentSection(section)) {
      continue;
    }
    lines.push(`## ${section.title}`, '', String(section.body ?? '').trim(), '');
  }

  return `${lines.join('\n').trim()}\n`;
}

function fillEntity(template) {
  return String(template ?? '')
    .replaceAll('{trading}', LEGAL_ENTITY.tradingName)
    .replaceAll('{company}', LEGAL_ENTITY.companyName);
}

function renderHome() {
  const seo = enMessages.Seo ?? {};
  return [
    `# ${BRAND.name}`,
    '',
    `> ${BRAND.tagline}`,
    '',
    BRAND.description,
    '',
    seo.homeIntro ?? '',
    '',
    `Canonical page: ${llmsAbsoluteUrl('/')}`,
    '',
    '## Product facts',
    '',
    '- Multi-city weather dashboard in the browser; no account required for forecasts or local pins.',
    '- Live conditions, hourly detail, and a 10-day outlook from OpenWeather.',
    '- Pin up to ten places on this device.',
    '- Installable progressive web app; managed offline/prefetch uses Functional consent.',
    '- Advertising loads only after advertising consent when AdSense is configured.',
    '',
    '## Out of scope for this corpus',
    '',
    '- Operator admin, login, invites, password reset, and internal APIs are not part of the public GEO surface.',
    '',
  ].join('\n');
}

function renderAbout() {
  const about = enMessages.About ?? {};
  return [
    `# ${about.title ?? 'About meridian'}`,
    '',
    `Canonical page: ${llmsAbsoluteUrl('/about')}`,
    '',
    about.lede ?? '',
    '',
    `## ${about.whatTitle ?? 'What meridian is'}`,
    '',
    about.whatBody1 ?? '',
    '',
    about.whatBody2 ?? '',
    '',
    `## ${about.dataTitle ?? 'Where the weather comes from'}`,
    '',
    about.dataBody1 ?? '',
    '',
    about.dataBody2 ?? '',
    '',
    `## ${about.whoTitle ?? 'Who runs meridian'}`,
    '',
    fillEntity(about.whoBody),
    '',
    about.whoBody2 ?? '',
    '',
    `## ${about.adsTitle ?? 'Ads, consent, and ad-free'}`,
    '',
    about.adsBody ?? '',
    '',
    `Legal entity: ${LEGAL_ENTITY.companyName} (${LEGAL_ENTITY.companyNumber}).`,
    `Privacy contact: ${LEGAL_ENTITY.privacyEmail}.`,
    '',
  ].join('\n');
}

function renderFaq() {
  const faq = enMessages.Faq ?? {};
  const items = faq.items ?? {};
  const lines = [
    `# ${faq.title ?? 'FAQ'}`,
    '',
    `Canonical page: ${llmsAbsoluteUrl('/faq')}`,
    '',
    faq.description ?? '',
    '',
  ];

  for (const item of Object.values(items)) {
    if (!item?.q || !item?.a) {
      continue;
    }
    lines.push(`## ${item.q}`, '', item.a, '');
  }

  return lines.join('\n');
}

function renderSearch() {
  return [
    '# Search',
    '',
    `Canonical page: ${llmsAbsoluteUrl('/search')}`,
    '',
    'Search for cities and places worldwide, then open a forecast page.',
    '',
    '## Facts',
    '',
    '- Type at least two characters; results appear after a short pause.',
    '- Location search may combine OpenWeather geocoding, OpenStreetMap/Nominatim-derived results, and local popular-city ranking.',
    '- Selecting a result opens that place’s city or `/weather` page.',
    '- Results can show a live weather preview when data is available.',
    '- No account is required.',
    '',
  ].join('\n');
}

function renderJournalIndex() {
  const lines = [
    '# Journal',
    '',
    `Canonical page: ${llmsAbsoluteUrl('/journal')}`,
    '',
    'Original Meridian articles about reading forecasts, UK weather patterns, consent, and using place pages.',
    '',
    '## Articles',
    '',
  ];

  for (const post of HOME_BLOG_POSTS) {
    lines.push(
      `- [${post.title}](${llmsAbsoluteUrl(`/llms/journal/${post.id}.txt`)}): ${post.excerpt}`,
    );
  }

  lines.push('');
  return lines.join('\n');
}

function renderDocsIndex() {
  const docs = listLlmsPublicPages().filter((page) => page.kind === 'doc');
  const lines = [
    '# Documentation',
    '',
    `Canonical page: ${llmsAbsoluteUrl('/docs')}`,
    '',
    'Visitor-facing product documentation. Operator API, deployment, and monetization runbooks are excluded from this GEO corpus.',
    '',
    '## Guides',
    '',
  ];

  for (const doc of docs) {
    lines.push(
      `- [${doc.title}](${llmsAbsoluteUrl(`/llms/${doc.llmsPath}`)}): ${doc.description}`,
    );
  }

  lines.push('');
  return lines.join('\n');
}

function renderDoc(slug) {
  const doc = DOCS_PAGE_DEFAULTS.find((entry) => entry.slug === slug);
  if (!doc) {
    return null;
  }
  return renderSectionsDocument({
    title: doc.title,
    sitePath: `/docs/${doc.slug}`,
    sections: doc.sections,
  });
}

function renderLegal(slug) {
  const policy = LEGAL_POLICY_DEFAULTS.find((entry) => entry.slug === slug);
  if (!policy) {
    return null;
  }
  return renderSectionsDocument({
    title: policy.title,
    sitePath: `/legal/${policy.slug}`,
    sections: policy.sections,
  });
}

function renderJournal(slug) {
  const post = HOME_BLOG_POSTS.find((entry) => entry.id === slug);
  if (!post) {
    return null;
  }
  const lines = [
    `# ${post.title}`,
    '',
    `Canonical page: ${llmsAbsoluteUrl(`/journal/${post.id}`)}`,
    '',
    post.excerpt,
    '',
    `Category: ${post.category}`,
    `Published: ${post.dateIso}`,
    '',
  ];

  for (const paragraph of post.body ?? []) {
    lines.push(paragraph, '');
  }

  return lines.join('\n');
}

function renderWeatherPlace(slug) {
  const blurb = PLACE_EDITORIAL_BLURBS[slug];
  if (!blurb) {
    return null;
  }
  const name = slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  return [
    `# ${name} weather`,
    '',
    `Canonical page: ${llmsAbsoluteUrl(`/weather/${slug}`)}`,
    '',
    blurb,
    '',
    '## On this page type',
    '',
    '- Live conditions, hourly detail, and a longer outlook from OpenWeather.',
    '- Optional OpenStreetMap “things to do” when available.',
    '- Optional published Meridian guides only (draft/stub filler is not published).',
    '- Informational weather only — follow official emergency guidance when safety matters.',
    '',
  ].join('\n');
}

/**
 * @param {{ kind: string, slug?: string }} page
 * @returns {string | null}
 */
export function renderLlmsPageBody(page) {
  switch (page.kind) {
    case 'home':
      return renderHome();
    case 'about':
      return renderAbout();
    case 'faq':
      return renderFaq();
    case 'search':
      return renderSearch();
    case 'journal-index':
      return renderJournalIndex();
    case 'docs-index':
      return renderDocsIndex();
    case 'doc':
      return renderDoc(page.slug);
    case 'legal':
      return renderLegal(page.slug);
    case 'journal':
      return renderJournal(page.slug);
    case 'weather-place':
      return renderWeatherPlace(page.slug);
    case 'meta':
      return null;
    default:
      return null;
  }
}
