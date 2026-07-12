export interface PhotoGalleryProps {
  /** Pre-signed URLs, already ordered (e.g. by sort_order). */
  urls: string[];
}

/**
 * Responsive photo grid for a date-log's gallery. Renders nothing when empty.
 *
 * Plain `<img>` on purpose, not `next/image` — every url here is a signed
 * `date-photos` URL whose `?token=` rotates per render, so optimizing it would
 * mint a fresh `/_next/image` cache entry each pageview for nothing (docs/plan/
 * 12-performance.md STEP D, item 3). `loading="lazy"` + the fixed `aspect-square`
 * container still buy CLS/bandwidth wins below the fold (item 11).
 */
export function PhotoGallery({ urls }: PhotoGalleryProps) {
  if (urls.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {urls.map((url, i) => (
        <div
          key={url}
          className="aspect-square overflow-hidden rounded-xl border border-border bg-surface"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={`데이트 사진 ${i + 1}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
