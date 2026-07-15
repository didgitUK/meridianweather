import {
  DEFAULT_EMAIL_TEMPLATES,
  EMAIL_TEMPLATE_DEFINITIONS,
  EMAIL_TEMPLATE_PREVIEW_VARS,
  EMAIL_TEMPLATE_SLUGS,
} from '@/constants/email-templates';
import { EMAIL_LAYOUT_MARKER } from '@/constants/email-template-themes';
import { getDb } from '@/lib/db';

function mapRow(row) {
  return {
    slug: row.slug,
    subject: row.subject,
    html: row.html,
    updatedAt: row.updated_at,
    isCustom: true,
  };
}

function htmlNeedsLayoutUpgrade(html) {
  const value = String(html ?? '');
  if (!value.includes(EMAIL_LAYOUT_MARKER)) {
    return true;
  }
  if (!value.includes('{{logoUrl}}')) {
    return true;
  }
  if (!value.includes('background-color:#000000')) {
    return true;
  }
  return false;
}

/**
 * Upgrade legacy email HTML to Meridian branded layout v2 (all categories).
 */
export function ensureEmailTemplatesUseBrandedLayout() {
  const db = getDb();
  const now = new Date().toISOString();
  const upsert = db.prepare(
    `INSERT INTO email_templates (slug, subject, html, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET
       subject = excluded.subject,
       html = excluded.html,
       updated_at = excluded.updated_at`,
  );

  for (const definition of EMAIL_TEMPLATE_DEFINITIONS) {
    const defaults = DEFAULT_EMAIL_TEMPLATES[definition.slug];
    if (!defaults) continue;

    const row = db.prepare('SELECT html FROM email_templates WHERE slug = ?').get(definition.slug);
    if (row && !htmlNeedsLayoutUpgrade(row.html)) {
      continue;
    }

    upsert.run(defaults.slug, defaults.subject, defaults.html, now);
  }
}

/** @deprecated Use ensureEmailTemplatesUseBrandedLayout */
export function ensureWeatherAlertTemplatesUseRichLayout() {
  ensureEmailTemplatesUseBrandedLayout();
}

export function ensureEmailTemplatesSeeded() {
  const db = getDb();
  const insert = db.prepare(
    `INSERT OR IGNORE INTO email_templates (slug, subject, html, updated_at)
     VALUES (?, ?, ?, ?)`,
  );

  const now = new Date().toISOString();

  for (const definition of EMAIL_TEMPLATE_DEFINITIONS) {
    const defaults = DEFAULT_EMAIL_TEMPLATES[definition.slug];
    insert.run(defaults.slug, defaults.subject, defaults.html, now);
  }

  ensureEmailTemplatesUseBrandedLayout();
}

export function listEmailTemplates() {
  ensureEmailTemplatesSeeded();

  const rows = getDb()
    .prepare('SELECT * FROM email_templates ORDER BY slug ASC')
    .all();

  return EMAIL_TEMPLATE_DEFINITIONS.map((definition) => {
    const row = rows.find((item) => item.slug === definition.slug);
    const defaults = DEFAULT_EMAIL_TEMPLATES[definition.slug];
    const template = row ? mapRow(row) : { ...defaults, updatedAt: null, isCustom: false };

    return {
      ...definition,
      ...template,
      defaultSubject: defaults.subject,
      defaultHtml: defaults.html,
      previewVars: EMAIL_TEMPLATE_PREVIEW_VARS[definition.slug],
    };
  });
}

export function getEmailTemplate(slug) {
  ensureEmailTemplatesSeeded();

  const defaults = DEFAULT_EMAIL_TEMPLATES[slug];
  if (!defaults) {
    return null;
  }

  const row = getDb().prepare('SELECT * FROM email_templates WHERE slug = ?').get(slug);
  const definition = EMAIL_TEMPLATE_DEFINITIONS.find((item) => item.slug === slug);

  if (!row) {
    return {
      ...definition,
      ...defaults,
      updatedAt: null,
      isCustom: false,
      defaultSubject: defaults.subject,
      defaultHtml: defaults.html,
      previewVars: EMAIL_TEMPLATE_PREVIEW_VARS[slug],
    };
  }

  return {
    ...definition,
    ...mapRow(row),
    defaultSubject: defaults.subject,
    defaultHtml: defaults.html,
    previewVars: EMAIL_TEMPLATE_PREVIEW_VARS[slug],
  };
}

export function upsertEmailTemplate(slug, { subject, html }) {
  const defaults = DEFAULT_EMAIL_TEMPLATES[slug];
  if (!defaults) {
    return null;
  }

  const nextSubject = typeof subject === 'string' ? subject.trim() : '';
  const nextHtml = typeof html === 'string' ? html.trim() : '';

  if (!nextSubject || !nextHtml) {
    throw new Error('Subject and HTML are required');
  }

  const now = new Date().toISOString();

  getDb()
    .prepare(
      `INSERT INTO email_templates (slug, subject, html, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET
         subject = excluded.subject,
         html = excluded.html,
         updated_at = excluded.updated_at`,
    )
    .run(slug, nextSubject, nextHtml, now);

  return getEmailTemplate(slug);
}

export function resetEmailTemplate(slug) {
  const defaults = DEFAULT_EMAIL_TEMPLATES[slug];
  if (!defaults) {
    return null;
  }

  return upsertEmailTemplate(slug, {
    subject: defaults.subject,
    html: defaults.html,
  });
}
