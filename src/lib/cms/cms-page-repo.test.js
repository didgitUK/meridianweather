import { describe, expect, it, beforeEach, vi } from 'vitest';
import Database from 'better-sqlite3';

const memoryDb = new Database(':memory:');
memoryDb.exec(`
CREATE TABLE cms_pages (
  collection TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  last_updated TEXT NOT NULL,
  content_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (collection, slug)
);
`);

vi.mock('@/lib/db', () => ({
  getDb: () => memoryDb,
}));

vi.mock('@/content/legal/defaults', () => ({
  LEGAL_POLICIES: [
    {
      slug: 'terms',
      title: 'Terms of Use',
      lastUpdated: '2026-01-01',
      sections: [{ id: 'service', title: 'Service', body: 'Default body' }],
    },
  ],
}));

vi.mock('@/content/docs/defaults', () => ({
  DOCS_PAGES: [
    {
      slug: 'getting-started',
      title: 'Getting started',
      lastUpdated: '2026-01-01',
      sections: [{ id: 'intro', title: 'Intro', body: 'Docs default' }],
    },
  ],
}));

import { upsertCmsPage, getCmsPage, listCmsPages, resetCmsPage } from '@/lib/cms/cms-page-repo';

describe('cms-page-repo', () => {
  beforeEach(() => {
    memoryDb.exec('DELETE FROM cms_pages');
  });

  it('seeds defaults and allows overrides', () => {
    const pages = listCmsPages('legal');
    expect(pages).toHaveLength(1);
    expect(pages[0].title).toBe('Terms of Use');

    upsertCmsPage('legal', 'terms', {
      title: 'Updated Terms',
      lastUpdated: '2026-07-12',
      sections: [{ id: 'service', title: 'Service', body: 'Edited body' }],
    });

    expect(getCmsPage('legal', 'terms').title).toBe('Updated Terms');
    expect(getCmsPage('legal', 'terms').sections[0].body).toBe('Edited body');

    resetCmsPage('legal', 'terms');
    expect(getCmsPage('legal', 'terms').title).toBe('Terms of Use');
  });
});
