export interface GuideStepProps {
  /** Fallback ordinal used only if `title` doesn't start with its own "N. " prefix. */
  index: number;
  title: string;
  body: string;
}

// Guide step titles are authored as "1. 소셜 로그인으로 시작하기" (docs/plan/10-content.md
// copy, kept verbatim). Splitting the leading "N. " out for the number badge is a
// presentation-only parse — it does not alter the underlying copy — so the badge and
// heading don't repeat the same digit.
const LEADING_NUMBER = /^(\d+)\.\s*(.+)$/;

/** One step row in the `/guide` "위로그 사용법" list: numbered badge + title + body. */
export function GuideStep({ index, title, body }: GuideStepProps) {
  const match = LEADING_NUMBER.exec(title);
  const badge = match ? match[1] : String(index);
  const heading = match ? match[2] : title;

  return (
    <li className="flex gap-4 rounded-2xl border border-border bg-surface p-5">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand"
      >
        {badge}
      </span>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-bold text-text-primary">{heading}</h3>
        <p className="text-sm leading-relaxed text-text-secondary">{body}</p>
      </div>
    </li>
  );
}
