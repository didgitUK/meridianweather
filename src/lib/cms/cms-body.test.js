import { describe, expect, it } from 'vitest';
import {
  looksLikeHtml,
  normalizeCmsBodyToHtml,
  paragraphsFromCmsBody,
  plainTextToHtml,
  sanitizeCmsHtml,
} from '@/lib/cms/cms-body';

describe('cms-body', () => {
  it('detects html vs plain text', () => {
    expect(looksLikeHtml('<p>Hi</p>')).toBe(true);
    expect(looksLikeHtml('Just a paragraph')).toBe(false);
  });

  it('wraps plain paragraphs for the editor', () => {
    expect(plainTextToHtml('One\n\nTwo')).toBe('<p>One</p><p>Two</p>');
    expect(normalizeCmsBodyToHtml(['Alpha', 'Beta'])).toBe('<p>Alpha</p><p>Beta</p>');
  });

  it('sanitizes disallowed tags and unsafe links', () => {
    const dirty = '<p>Hello <script>alert(1)</script><strong>world</strong></p><a href="javascript:alert(1)">x</a><a href="https://example.com">ok</a>';
    const clean = sanitizeCmsHtml(dirty);
    expect(clean).toContain('<strong>world</strong>');
    expect(clean).not.toContain('script');
    expect(clean).toContain('href="https://example.com"');
    expect(clean).not.toContain('javascript:');
  });

  it('extracts paragraphs from html', () => {
    expect(paragraphsFromCmsBody('<p>One</p><p>Two</p>')).toEqual(['One', 'Two']);
  });
});
