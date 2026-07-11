export interface PageTitleProps {
  children: React.ReactNode;
  /**
   * Extra classes — typically just the responsive font-size scale (e.g.
   * `"text-2xl md:text-4xl"`), since that varies per page (compact detail
   * titles vs. the bigger feed/explore titles). Merged after the shared base.
   */
  className?: string;
}

/**
 * Shared `<h1>` page-title styling: **bold** weight + **tight tracking**
 * (Korean headings, DESIGN.md "굵기 위계 정리" — extrabold is reserved for
 * display-scale hero copy, not page titles) + primary text color. Extracted
 * so every page title stays in lockstep instead of repeating the same three
 * utility classes (uiux-reviewer B-round finding #4).
 */
export function PageTitle({ children, className = '' }: PageTitleProps) {
  return <h1 className={`font-bold tracking-tight text-text-primary ${className}`}>{children}</h1>;
}
