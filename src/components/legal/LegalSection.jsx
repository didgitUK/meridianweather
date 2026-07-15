import { CmsBody } from '@/components/cms/CmsBody';

export function LegalSection({ section }) {
  return (
    <section id={section.id} aria-labelledby={`${section.id}-title`}>
      <h2 id={`${section.id}-title`} className="font-heading text-2xl">
        {section.title}
      </h2>
      <CmsBody
        html={section.body}
        className="mt-3 space-y-3 text-muted-foreground [&_a]:text-primary [&_a]:underline [&_h2]:mt-4 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:text-foreground [&_h3]:mt-3 [&_h3]:font-heading [&_h3]:text-lg [&_h3]:text-foreground [&_li]:ms-5 [&_ol]:list-decimal [&_ul]:list-disc"
      />
    </section>
  );
}
