import localFont from 'next/font/local';

/**
 * BMJUA (주아체) — **logo wordmark only** (see DESIGN.md / 08-theme-tokens).
 * Self-hosted via next/font/local and exposed as the `--font-jua` CSS variable,
 * which `fontFamily.jua` / `fontFamily.logo` (Tailwind) reference. It is NOT the
 * UI font — product text stays Pretendard. Applied solely on `<Logo>`.
 *
 * `display: 'swap'` avoids blocking first paint on the ~1.5MB face; since only
 * the wordmark uses it, the cost is isolated to that one element.
 */
export const jua = localFont({
  src: '../fonts/BMJUA_ttf.ttf',
  variable: '--font-jua',
  weight: '400',
  style: 'normal',
  display: 'swap',
  preload: false,
  fallback: ['Pretendard', 'sans-serif'],
});
