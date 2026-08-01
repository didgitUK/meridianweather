import { findLlmsPageByPath, llmsTextResponse, renderLlmsPageBody } from '@/lib/llms';

/**
 * Per-page GEO microfiles under `/llms/**/*.txt`.
 * @param {{ params: Promise<{ path: string[] }> }} context
 */
export async function GET(_request, context) {
  const { path = [] } = await context.params;
  const joined = path.join('/');
  const page = findLlmsPageByPath(joined);

  if (!page || page.kind === 'meta') {
    return new Response('Not found\n', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const body = renderLlmsPageBody(page);
  if (!body) {
    return new Response('Not found\n', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return llmsTextResponse(body);
}
