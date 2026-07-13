export function LegalSection({ section }) {
  return (
    <section id={section.id} aria-labelledby={`${section.id}-title`}>
      <h2 id={`${section.id}-title`} className="font-heading text-2xl">
        {section.title}
      </h2>
      <p className="mt-3 text-muted-foreground">{section.body}</p>
    </section>
  );
}
