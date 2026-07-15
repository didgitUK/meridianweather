import { HOME_BLOG_POSTS } from '@/constants/blog-posts-defaults';
import { plainTextToHtml } from '@/lib/cms/cms-body';
import { getDb } from '@/lib/db';

function defaultFromConstant(post) {
  return {
    slug: post.id,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    dateIso: post.dateIso,
    dateLabel: post.dateLabel,
    imageUrl: post.imageUrl,
    imageAlt: post.imageAlt,
    bodyHtml: plainTextToHtml(post.body),
  };
}

function mapRow(row) {
  if (!row) {
    return null;
  }

  return {
    slug: row.slug,
    id: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    dateIso: row.date_iso,
    dateLabel: row.date_label,
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    bodyHtml: row.body_html,
    href: `/journal/${row.slug}`,
    updatedAt: row.updated_at,
  };
}

function toPublicPost(post) {
  if (!post) {
    return null;
  }

  return {
    id: post.id ?? post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    dateLabel: post.dateLabel,
    dateIso: post.dateIso,
    href: post.href ?? `/journal/${post.slug}`,
    imageUrl: post.imageUrl,
    imageAlt: post.imageAlt,
    bodyHtml: post.bodyHtml,
    body: undefined,
  };
}

export function ensureBlogPostsSeeded() {
  const db = getDb();
  const insert = db.prepare(
    `INSERT OR IGNORE INTO blog_posts (
       slug, title, excerpt, category, date_iso, date_label,
       image_url, image_alt, body_html, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const now = new Date().toISOString();

  for (const post of HOME_BLOG_POSTS) {
    const defaults = defaultFromConstant(post);
    insert.run(
      defaults.slug,
      defaults.title,
      defaults.excerpt,
      defaults.category,
      defaults.dateIso,
      defaults.dateLabel,
      defaults.imageUrl,
      defaults.imageAlt,
      defaults.bodyHtml,
      now,
    );
  }
}

export function listBlogPosts() {
  ensureBlogPostsSeeded();
  const rows = getDb()
    .prepare(
      `SELECT slug, title, excerpt, category, date_iso, date_label,
              image_url, image_alt, body_html, updated_at
       FROM blog_posts
       ORDER BY date_iso DESC, slug ASC`,
    )
    .all();

  const bySlug = new Map(rows.map((row) => [row.slug, mapRow(row)]));

  // Keep seed order for unknown extras; prefer DB dates already ordered.
  const ordered = [];
  for (const post of HOME_BLOG_POSTS) {
    const entry = bySlug.get(post.id);
    if (entry) {
      ordered.push(entry);
      bySlug.delete(post.id);
    }
  }

  for (const entry of bySlug.values()) {
    ordered.push(entry);
  }

  return ordered;
}

export function getBlogPost(slug) {
  ensureBlogPostsSeeded();
  const row = getDb()
    .prepare(
      `SELECT slug, title, excerpt, category, date_iso, date_label,
              image_url, image_alt, body_html, updated_at
       FROM blog_posts
       WHERE slug = ?`,
    )
    .get(slug);

  return mapRow(row);
}

/**
 * Public shape used by journal routes (English / CMS path).
 */
export function listPublicBlogPosts() {
  return listBlogPosts().map(toPublicPost);
}

/**
 * @param {string} slug
 */
export function getPublicBlogPost(slug) {
  return toPublicPost(getBlogPost(slug));
}

/**
 * @param {string} slug
 * @param {object} input
 */
export function upsertBlogPost(slug, input) {
  ensureBlogPostsSeeded();
  const existing = getBlogPost(slug);
  if (!existing && !HOME_BLOG_POSTS.some((post) => post.id === slug)) {
    // Allow new posts created in admin
  }

  const now = new Date().toISOString();
  const next = {
    slug,
    title: String(input.title ?? existing?.title ?? '').trim(),
    excerpt: String(input.excerpt ?? existing?.excerpt ?? '').trim(),
    category: String(input.category ?? existing?.category ?? '').trim(),
    dateIso: String(input.dateIso ?? existing?.dateIso ?? '').trim(),
    dateLabel: String(input.dateLabel ?? existing?.dateLabel ?? '').trim(),
    imageUrl: String(input.imageUrl ?? existing?.imageUrl ?? '').trim(),
    imageAlt: String(input.imageAlt ?? existing?.imageAlt ?? '').trim(),
    bodyHtml: String(input.bodyHtml ?? existing?.bodyHtml ?? '').trim() || '<p></p>',
  };

  if (!next.title) {
    throw new Error('title is required');
  }

  getDb()
    .prepare(
      `INSERT INTO blog_posts (
         slug, title, excerpt, category, date_iso, date_label,
         image_url, image_alt, body_html, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET
         title = excluded.title,
         excerpt = excluded.excerpt,
         category = excluded.category,
         date_iso = excluded.date_iso,
         date_label = excluded.date_label,
         image_url = excluded.image_url,
         image_alt = excluded.image_alt,
         body_html = excluded.body_html,
         updated_at = excluded.updated_at`,
    )
    .run(
      next.slug,
      next.title,
      next.excerpt,
      next.category,
      next.dateIso,
      next.dateLabel,
      next.imageUrl,
      next.imageAlt,
      next.bodyHtml,
      now,
    );

  return getBlogPost(slug);
}

/**
 * @param {string} slug
 */
export function resetBlogPost(slug) {
  const fileDefault = HOME_BLOG_POSTS.find((post) => post.id === slug);
  if (!fileDefault) {
    return null;
  }

  const defaults = defaultFromConstant(fileDefault);
  return upsertBlogPost(slug, defaults);
}

export function listBlogPostSlugs() {
  return listBlogPosts().map((post) => post.slug);
}
