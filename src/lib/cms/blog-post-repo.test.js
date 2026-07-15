import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('blog-post-repo', () => {
  let dbPath;
  let getPublicBlogPost;
  let listPublicBlogPosts;
  let resetBlogPost;
  let upsertBlogPost;

  beforeEach(async () => {
    dbPath = path.join(os.tmpdir(), `meridian-blog-${Date.now()}-${Math.random()}.db`);
    process.env.DATABASE_PATH = dbPath;
    vi.resetModules();

    ({
      getPublicBlogPost,
      listPublicBlogPosts,
      resetBlogPost,
      upsertBlogPost,
    } = await import('@/lib/cms/blog-post-repo'));
  });

  afterEach(() => {
    try {
      fs.unlinkSync(dbPath);
    } catch {
      // ignore
    }
    try {
      fs.unlinkSync(`${dbPath}-wal`);
    } catch {
      // ignore
    }
    try {
      fs.unlinkSync(`${dbPath}-shm`);
    } catch {
      // ignore
    }
  });

  it('seeds default journal posts', () => {
    const posts = listPublicBlogPosts();
    expect(posts.length).toBeGreaterThanOrEqual(6);
    expect(posts[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      href: expect.stringMatching(/^\/journal\//),
      bodyHtml: expect.stringContaining('<p>'),
    });
  });

  it('updates a post and can reset to defaults', () => {
    const slug = 'reading-hourly-forecasts';
    upsertBlogPost(slug, {
      title: 'Edited title',
      excerpt: 'Edited excerpt',
      category: 'Guides',
      dateIso: '2026-07-12',
      dateLabel: '12 Jul 2026',
      imageUrl: 'https://example.com/a.jpg',
      imageAlt: 'Alt',
      bodyHtml: '<p>Custom body</p>',
    });

    expect(getPublicBlogPost(slug)?.title).toBe('Edited title');
    expect(getPublicBlogPost(slug)?.bodyHtml).toContain('Custom body');

    resetBlogPost(slug);
    expect(getPublicBlogPost(slug)?.title).toMatch(/hourly forecast/i);
  });
});
