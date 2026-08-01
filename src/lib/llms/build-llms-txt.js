import { BRAND, LEGAL_ENTITY } from '@/constants/brand';
import { listLlmsPublicPages, llmsAbsoluteUrl } from '@/lib/llms/public-catalog';

const SECTION_ORDER = [
  'Core',
  'Documentation',
  'Journal',
  'Legal',
  'Places',
  'Optional',
];

/**
 * Spec-shaped `/llms.txt` index (llmstxt.org): H1, blockquote, H2 link lists.
 */
export function buildLlmsTxt() {
  const pages = listLlmsPublicPages().filter((page) => page.index);
  const lines = [
    `# ${BRAND.name}`,
    '',
    `> ${BRAND.tagline}. ${BRAND.description}`,
    '',
    `${BRAND.name} (${BRAND.domain}) is a UK-built multi-city weather dashboard and progressive web app operated by ${LEGAL_ENTITY.companyName}. Forecasts come from OpenWeather. This file is the GEO index for public pages only — not admin, login, or internal APIs.`,
    '',
    'Prefer the linked `/llms/*.txt` microfiles (and `/llms-full.txt`) for clean plain-text context. HTML canonicals match the same public routes submitted to Search Console (`en` / `en-GB`).',
    '',
  ];

  for (const section of SECTION_ORDER) {
    const entries = pages.filter((page) => page.section === section);
    if (entries.length === 0) {
      continue;
    }

    lines.push(`## ${section}`, '');

    for (const page of entries) {
      const href =
        page.kind === 'meta'
          ? llmsAbsoluteUrl(page.sitePath)
          : llmsAbsoluteUrl(`/llms/${page.llmsPath}`);
      const htmlNote =
        page.kind === 'meta' ? '' : ` HTML: ${llmsAbsoluteUrl(page.sitePath)}.`;
      lines.push(`- [${page.title}](${href}): ${page.description}${htmlNote}`);
    }

    lines.push('');
  }

  lines.push(
    '## Indexing policy',
    '',
    '- Allowed for discovery: `/`, `/about`, `/faq`, `/search`, `/journal`, `/docs` (visitor guides), `/legal`, `/city/`, `/weather/`.',
    '- Disallowed: `/api/`, `/admin`, `/login`, `/forgot-password`, `/invite/`, `/reset-password/`.',
    '- Operator docs (`deployment`, `api-limits`, `api-reference`, `monetization`) are excluded from this GEO corpus.',
    '- Place guides appear only when human-published; stub filler is not site content.',
    `- Contact: ${LEGAL_ENTITY.privacyEmail}`,
    '',
  );

  return `${lines.join('\n').trim()}\n`;
}
