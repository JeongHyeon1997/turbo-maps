/**
 * Formats a `yyyy-mm-dd`(-ish) date string as `yyyy.mm.dd` by slicing/splitting
 * the raw string directly — avoids `Date` timezone/locale drift that would
 * cause SSR/client hydration mismatches.
 */
export function formatLogDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${y}.${m}.${d}`;
}

const articleDateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC', // pin formatting to the plain calendar date, independent of server locale/TZ
});

/**
 * Formats a `yyyy-mm-dd`(-ish) date string as a Korean long date ("2026년 7월
 * 12일") via `Intl.DateTimeFormat('ko-KR')` — used for editorial article
 * metadata (`ArticleMeta`, DESIGN.md "장문 에디토리얼"). The machine-readable
 * value belongs on the surrounding `<time dateTime>` attribute; this only
 * formats the human-readable label.
 */
export function formatArticleDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return articleDateFormatter.format(new Date(Date.UTC(Number(y), Number(m) - 1, Number(d))));
}
