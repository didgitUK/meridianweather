import { LEGAL_POLICIES as FILE_LEGAL_POLICIES } from '@/content/legal/defaults';
import { DOCS_PAGES as FILE_DOCS_PAGES } from '@/content/docs/defaults';
import { CMS_COLLECTION } from '@/constants/cms';
import { getDb } from '@/lib/db';

function getFileDefaults(collection) {
  if (collection === CMS_COLLECTION.LEGAL) {
    return FILE_LEGAL_POLICIES;
  }

  if (collection === CMS_COLLECTION.DOCS) {
    return FILE_DOCS_PAGES;
  }

  return [];
}

function mapRow(row) {
  let sections = [];

  try {
    sections = JSON.parse(row.content_json);
  } catch {
    sections = [];
  }

  if (!Array.isArray(sections)) {
    sections = [];
  }

  return {
    collection: row.collection,
    slug: row.slug,
    title: row.title,
    lastUpdated: row.last_updated,
    sections,
    updatedAt: row.updated_at,
  };
}

function normalizePage(page) {
  return {
    slug: page.slug,
    title: page.title,
    lastUpdated: page.lastUpdated,
    sections: Array.isArray(page.sections)
      ? page.sections.map((section) => ({
          id: String(section.id ?? '').trim(),
          title: String(section.title ?? '').trim(),
          body: String(section.body ?? '').trim(),
        }))
      : [],
  };
}

export function ensureCmsPagesSeeded(collection) {
  const defaults = getFileDefaults(collection);
  const db = getDb();
  const insert = db.prepare(
    `INSERT OR IGNORE INTO cms_pages (collection, slug, title, last_updated, content_json, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const now = new Date().toISOString();

  for (const page of defaults) {
    insert.run(
      collection,
      page.slug,
      page.title,
      page.lastUpdated,
      JSON.stringify(page.sections ?? []),
      now,
    );
  }
}

export function listCmsPages(collection) {
  ensureCmsPagesSeeded(collection);
  const defaults = getFileDefaults(collection);
  const rows = getDb()
    .prepare(
      `SELECT * FROM cms_pages
       WHERE collection = ?
       ORDER BY slug ASC`,
    )
    .all(collection);

  return defaults.map((fallback) => {
    const row = rows.find((item) => item.slug === fallback.slug);
    const page = row ? mapRow(row) : normalizePage(fallback);

    return {
      ...page,
      collection,
      defaultTitle: fallback.title,
      defaultLastUpdated: fallback.lastUpdated,
      defaultSections: fallback.sections,
    };
  });
}

export function getCmsPage(collection, slug) {
  ensureCmsPagesSeeded(collection);
  const defaults = getFileDefaults(collection);
  const fallback = defaults.find((page) => page.slug === slug);

  if (!fallback) {
    return null;
  }

  const row = getDb()
    .prepare('SELECT * FROM cms_pages WHERE collection = ? AND slug = ?')
    .get(collection, slug);

  if (!row) {
    return {
      ...normalizePage(fallback),
      collection,
      defaultTitle: fallback.title,
      defaultLastUpdated: fallback.lastUpdated,
      defaultSections: fallback.sections,
    };
  }

  return {
    ...mapRow(row),
    defaultTitle: fallback.title,
    defaultLastUpdated: fallback.lastUpdated,
    defaultSections: fallback.sections,
  };
}

export function upsertCmsPage(collection, slug, { title, lastUpdated, sections }) {
  const defaults = getFileDefaults(collection);
  const fallback = defaults.find((page) => page.slug === slug);

  if (!fallback) {
    return null;
  }

  const nextTitle = typeof title === 'string' ? title.trim() : '';
  const nextLastUpdated = typeof lastUpdated === 'string' ? lastUpdated.trim() : '';
  const nextSections = Array.isArray(sections) ? sections : [];

  if (!nextTitle || !nextLastUpdated) {
    throw new Error('Title and last updated date are required');
  }

  if (nextSections.length === 0) {
    throw new Error('At least one section is required');
  }

  for (const section of nextSections) {
    if (!section.id?.trim() || !section.title?.trim() || !section.body?.trim()) {
      throw new Error('Each section needs an id, title, and body');
    }
  }

  const now = new Date().toISOString();
  const normalizedSections = nextSections.map((section) => ({
    id: section.id.trim(),
    title: section.title.trim(),
    body: section.body.trim(),
  }));

  getDb()
    .prepare(
      `INSERT INTO cms_pages (collection, slug, title, last_updated, content_json, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(collection, slug) DO UPDATE SET
         title = excluded.title,
         last_updated = excluded.last_updated,
         content_json = excluded.content_json,
         updated_at = excluded.updated_at`,
    )
    .run(
      collection,
      slug,
      nextTitle,
      nextLastUpdated,
      JSON.stringify(normalizedSections),
      now,
    );

  return getCmsPage(collection, slug);
}

export function resetCmsPage(collection, slug) {
  const defaults = getFileDefaults(collection);
  const fallback = defaults.find((page) => page.slug === slug);

  if (!fallback) {
    return null;
  }

  return upsertCmsPage(collection, slug, {
    title: fallback.title,
    lastUpdated: fallback.lastUpdated,
    sections: fallback.sections,
  });
}
