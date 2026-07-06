export interface PhotoGalleryProps {
  /** Pre-signed URLs, already ordered (e.g. by sort_order). */
  urls: string[];
}

/** Responsive photo grid for a date-log's gallery. Renders nothing when empty. */
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
          <img src={url} alt={`데이트 사진 ${i + 1}`} className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  );
}
