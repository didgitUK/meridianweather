import {
  looksLikeHtml,
  paragraphsFromCmsBody,
  sanitizeCmsHtml,
} from '@/lib/cms/cms-body';

/**
 * Renders CMS/blog body: allowlisted HTML, or legacy plain paragraphs.
 * @param {{ html?: string | null, paragraphs?: string[] | null, className?: string }} props
 */
export function CmsBody({ html, paragraphs, className }) {
  const raw = html ?? (Array.isArray(paragraphs) ? paragraphs.join('\n\n') : '');
  const value = String(raw ?? '').trim();

  if (!value) {
    return null;
  }

  if (looksLikeHtml(value)) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(value) }}
      />
    );
  }

  const parts = Array.isArray(paragraphs) && paragraphs.length > 0
    ? paragraphs
    : paragraphsFromCmsBody(value);

  return (
    <div className={className}>
      {parts.map((paragraph) => (
        <p key={paragraph.slice(0, 64)}>{paragraph}</p>
      ))}
    </div>
  );
}
