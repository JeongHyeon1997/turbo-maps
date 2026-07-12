export interface PhotoThumbProps {
  src: string;
  alt?: string;
  onRemove: () => void;
}

/** One removable photo preview tile — used while composing a date-log's gallery. */
export function PhotoThumb({ src, alt = '사진 미리보기', onRemove }: PhotoThumbProps) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-surface">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label="사진 제거"
        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-xs font-bold text-white transition-all duration-200 ease-out hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:scale-90"
      >
        ✕
      </button>
    </div>
  );
}
