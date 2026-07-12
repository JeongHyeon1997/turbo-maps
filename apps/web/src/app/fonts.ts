import localFont from 'next/font/local';

/**
 * BMJUA (주아체) — **logo wordmark only** (see DESIGN.md / 08-theme-tokens).
 * Self-hosted via next/font/local and exposed as the `--font-jua` CSS variable,
 * which `fontFamily.jua` / `fontFamily.logo` (Tailwind) reference. It is NOT the
 * UI font — product text stays Pretendard. Applied solely on `<Logo>`.
 *
 * `<Logo>` only ever renders the literal string "위로그", so the face is
 * subset (pyftsubset) down to those 3 Hangul glyphs + basic Latin/digits/space
 * (safety margin for any future Latin wordmark variant) — woff2, ~18KB vs the
 * original TTF's 1.5MB (perf audit #8, docs/plan/12-performance.md). Widen the
 * `--unicodes` set used to regenerate `BMJUA-subset.woff2` if `<Logo>` ever
 * renders different characters, or glyphs will silently fall back.
 *
 * `display: 'swap'` avoids blocking first paint on the wordmark face; since
 * only the wordmark uses it, the cost is isolated to that one element.
 */
export const jua = localFont({
  src: '../fonts/BMJUA-subset.woff2',
  variable: '--font-jua',
  weight: '400',
  style: 'normal',
  display: 'swap',
  preload: false,
  fallback: ['Pretendard Variable', 'sans-serif'],
});
