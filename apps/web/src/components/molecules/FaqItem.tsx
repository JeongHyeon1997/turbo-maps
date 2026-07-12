export interface FaqItemProps {
  question: string;
  answer: string;
}

/**
 * One collapsible Q&A row on `/faq`. Native `<details>/<summary>` — no client JS
 * needed for the accordion (SSR-friendly, works with JS disabled, keeps the page
 * static). `summary` carries the 44px touch target + focus-visible ring; the card
 * itself uses border-only emphasis (DESIGN.md "카드 이중강조 금지" — no shadow).
 */
export function FaqItem({ question, answer }: FaqItemProps) {
  return (
    <details className="group rounded-2xl border border-border bg-surface open:border-border-strong">
      <summary
        className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand [&::-webkit-details-marker]:hidden"
      >
        <span>{question}</span>
        <span
          aria-hidden="true"
          className="shrink-0 text-text-muted transition-transform duration-200 ease-out group-open:rotate-180"
        >
          ⌄
        </span>
      </summary>
      <p className="px-5 pb-4 text-sm leading-relaxed text-text-secondary">{answer}</p>
    </details>
  );
}
