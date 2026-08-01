import { BRAND } from '@/constants/brand';
import { listLlmsPublicPages, llmsAbsoluteUrl } from '@/lib/llms/public-catalog';
import { renderLlmsPageBody } from '@/lib/llms/render-page';

/**
 * Concatenated public GEO corpus for one-pass agent ingestion.
 */
export function buildLlmsFullTxt() {
  const pages = listLlmsPublicPages().filter((page) => page.kind !== 'meta');
  const chunks = [
    `# ${BRAND.name} — full public GEO corpus`,
    '',
    `Generated from product content libraries. Index: ${llmsAbsoluteUrl('/llms.txt')}`,
    '',
    'Admin, login, and operator API documentation are intentionally omitted.',
    '',
  ];

  for (const page of pages) {
    const body = renderLlmsPageBody(page);
    if (!body) {
      continue;
    }
    chunks.push(
      '---',
      '',
      `Source microfile: ${llmsAbsoluteUrl(`/llms/${page.llmsPath}`)}`,
      '',
      body.trim(),
      '',
    );
  }

  return `${chunks.join('\n').trim()}\n`;
}
