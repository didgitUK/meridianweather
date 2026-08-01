import { describe, expect, it } from 'vitest';
import {
  buildLlmsFullTxt,
  buildLlmsTxt,
  findLlmsPageByPath,
  listLlmsPublicPages,
  renderLlmsPageBody,
} from '@/lib/llms';
import { DOCS_NOINDEX_SLUGS } from '@/lib/seo-indexability';

describe('llms GEO surface', () => {
  it('builds a spec-shaped llms.txt index without admin or operator docs', () => {
    const body = buildLlmsTxt();

    expect(body.startsWith('# meridian\n')).toBe(true);
    expect(body).toContain('> Tracking The Weather Across Your World');
    expect(body).toContain('## Core');
    expect(body).toContain('/llms/about.txt');
    expect(body).toContain('/llms-full.txt');
    expect(body).toContain('/ai.txt');
    expect(body).toContain('/.well-known/llms.txt');
    expect(body).toContain('Disallowed:');
    expect(body).not.toContain('](https://meridianweather.co.uk/admin');
    expect(body).not.toContain('](https://meridianweather.co.uk/login');
    expect(body).not.toContain('/docs/deployment');
    expect(body).not.toContain('/docs/api-reference');
    expect(body).not.toContain('For site operators');
    expect(body).not.toContain('OPENWEATHER_API_KEY');
  });

  it('excludes noindex operator docs from the public catalog', () => {
    const keys = listLlmsPublicPages().map((page) => page.key);
    for (const slug of DOCS_NOINDEX_SLUGS) {
      expect(keys).not.toContain(`docs/${slug}`);
    }
    expect(keys).toContain('docs/getting-started');
    expect(keys).toContain('about');
    expect(keys).toContain('weather/london');
  });

  it('renders per-page microfiles and resolves paths', () => {
    const about = findLlmsPageByPath('about.txt');
    expect(about?.kind).toBe('about');
    const aboutBody = renderLlmsPageBody(about);
    expect(aboutBody).toContain('About meridian');
    expect(aboutBody).not.toContain('/admin');

    const doc = findLlmsPageByPath('docs/getting-started.txt');
    const docBody = renderLlmsPageBody(doc);
    expect(docBody).toContain('Getting started');
    expect(docBody).not.toContain('For site operators');
    expect(docBody).not.toContain('OPENWEATHER_API_KEY');

    expect(findLlmsPageByPath('docs/deployment.txt')).toBeNull();
  });

  it('builds llms-full without operator leakage', () => {
    const full = buildLlmsFullTxt();
    expect(full).toContain('full public GEO corpus');
    expect(full).toContain('Canonical page:');
    expect(full).toContain('London');
    expect(full).not.toContain('meridian_admin_session');
    expect(full).not.toContain('CRON_SECRET');
    expect(full).not.toContain('For site operators');
    expect(full).not.toContain('admin console');
  });
});
