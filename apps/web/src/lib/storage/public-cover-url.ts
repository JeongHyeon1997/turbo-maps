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
