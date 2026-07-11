import { PageTitle } from '@/components/atoms';

export interface PolicyDocumentProps {
  title: string;
  intro: string;
  effectiveDate: string;
  children: React.ReactNode;
}

/** Shared "title + prose body" shell for /privacy and /terms — keeps both pages in sync visually. */
export function PolicyDocument({ title, intro, effectiveDate, children }: PolicyDocumentProps) {
  return (
    <article className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-5 py-12 md:px-8 md:py-16">
      <header className="flex flex-col gap-3 border-b border-divider pb-8">
        <PageTitle className="text-2xl md:text-3xl">{title}</PageTitle>
        <p className="text-sm leading-relaxed text-text-secondary">{intro}</p>
        <p className="text-xs text-text-secondary">시행일: {effectiveDate}</p>
      </header>
      <div className="flex flex-col gap-8">{children}</div>
    </article>
  );
}
