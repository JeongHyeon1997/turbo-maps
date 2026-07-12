// Public-covers is a public-read Supabase Storage bucket (see 0006 migration) —
// its objects load over a plain, token-free URL, unlike the private `date-photos`
// bucket which needs signed URLs. See docs/DECISIONS.md (2026-07-06).

/**
 * Builds the token-free public URL for a `public-covers` object, or `null` when
 * there is no path (private log / no cover copied yet) or the env var is unset.
 */
export function publicCoverUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/public-covers/${path}`;
}

/**
 * True for a stable, token-free `/storage/v1/object/public/...` URL (safe to hand
 * to `next/image` — see `next.config.mjs` remotePatterns). False for anything else,
 * notably the private `date-photos` bucket's signed URLs
 * (`/storage/v1/object/sign/...?token=...`), which rotate their query string on
 * every render and would otherwise mint a fresh `/_next/image` cache key each time
 * for nothing (docs/plan/12-performance.md STEP D, item 3). `CoverHero` and
 * `DateLogCard` share this to pick next/image vs. a plain `<img>` per-cover, since
 * both components render either kind depending on caller (public explore vs.
 * private signed home/detail covers).
 */
export function isPublicCoverUrl(url: string): boolean {
  return url.includes('/storage/v1/object/public/');
}
