function paragraphsFromBody(body) {
  const text = String(body ?? '').trim();
  if (!text) {
    return [];
  }

  return text
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function LegalSection({ section }) {
  const paragraphs = paragraphsFromBody(section.body);

  return (
    <section id={section.id} aria-labelledby={`${section.id}-title`}>
      <h2 id={`${section.id}-title`} className="font-heading text-2xl">
        {section.title}
      </h2>
      <div className="mt-3 space-y-3 text-muted-foreground">
        {paragraphs.map((paragraph, index) => (
          <p key={`${section.id}-${index}`}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
