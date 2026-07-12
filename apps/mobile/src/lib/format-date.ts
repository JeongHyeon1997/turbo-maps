/**
 * Formats a `yyyy-mm-dd`(-ish) date string as `yyyy.mm.dd` by slicing/splitting
 * the raw string directly — avoids `Date` timezone drift. Mirrors web's
 * `apps/web/src/lib/format-date.ts` `formatLogDate` (plain util, not shared —
 * `@maps/shared` only holds Zod schemas, not formatting helpers).
 */
export function formatLogDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${y}.${m}.${d}`;
}
