/**
 * Formats a `yyyy-mm-dd`(-ish) date string as `yyyy.mm.dd` by slicing/splitting
 * the raw string directly — avoids `Date` timezone/locale drift that would
 * cause SSR/client hydration mismatches.
 */
export function formatLogDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${y}.${m}.${d}`;
}
