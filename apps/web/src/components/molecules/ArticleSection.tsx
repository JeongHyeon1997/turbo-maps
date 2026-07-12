export interface ArticleSectionProps {
  heading: string;
  paragraphs: string[];
}

/**
 * One `/guide/[slug]` body section: `h2` heading + paragraph stack. Long-form
 * rhythm per DESIGN.md "장문 타이포·리듬" — heading→body `gap-3`, paragraph→
 * paragraph `gap-4`; the `gap-10` between sections is applied by the page, not
 * here (this component only owns its own internal spacing).
 */
export function ArticleSection({ heading, paragraphs }: ArticleSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold tracking-tight text-text-primary md:text-2xl">{heading}</h2>
      <div className="flex flex-col gap-4">
        {paragraphs.map((paragraph, i) => (
          <p key={i} className="text-base leading-relaxed text-text-primary">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
