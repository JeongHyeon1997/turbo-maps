export interface CoverFallbackProps {
  className?: string;
  /** Visual weight of the fallback plane. `neutral` (default) for feed/card
   * contexts; `brand` gives a soft blue-tinted plane for hero/detail contexts. */
  tone?: 'neutral' | 'brand';
}

/**
 * Photo-less cover placeholder — a single quiet plane (`surfaceAlt`/`brandSoft`)
 * + a neutral pin icon, replacing the retired 5-hue gradient fallback (DESIGN.md
 * "커버 폴백 단순화"). Purely decorative (`aria-hidden`) since callers always pair
 * it with real text (date/title) elsewhere in the card.
 */
export function CoverFallback({ className = '', tone = 'neutral' }: CoverFallbackProps) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center ${tone === 'brand' ? 'bg-brand-soft' : 'bg-surface-alt'} ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-8 w-8 ${tone === 'brand' ? 'text-brand' : 'text-text-muted dark:text-text-secondary'}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <rect x="3" y="4" width="18" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="M4 17l5-5a2 2 0 0 1 2.8 0L18 18" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
