import Image from 'next/image';
import { CoverFallback } from '@/components/atoms';
import { isPublicCoverUrl } from '@/lib/storage/public-cover-url';

export interface CoverHeroProps {
  title: string;
  dateLabel: string;
  coverImage?: string | null;
  /**
   * Marks this cover as the page's LCP image (skip-lazy, high fetch priority).
   * Only takes effect when `coverImage` is next/image-eligible (see below) — pass
   * it from every detail-page callsite regardless, so it activates automatically
   * once/if a signed cover is ever swapped for a public one.
   */
  priority?: boolean;
}

/**
 * Large detail-page cover (course/date-log hero): real photo when present, else
 * `CoverFallback`. Text treatment flips with it — white-on-photo needs the
 * scrim/drop-shadow it already had, but that same white would fail contrast on
 * the plain neutral fallback plane, so the no-photo path switches to solid
 * foreground tokens instead (DESIGN.md risk #4 — dark-mode/no-photo contrast).
 * Shared by `/explore/[id]` and `/logs/[id]` (was duplicated between them).
 *
 * The photo itself renders through `next/image` only for the stable, token-free
 * `public-covers` URL (`/explore/[id]`) — `isPublicCoverUrl` gates it. The
 * private `date-photos` bucket's signed cover (`/logs/[id]`) stays a plain `<img>`
 * on purpose: its `?token=` rotates every render, so optimizing it would just mint
 * a fresh `/_next/image` cache entry per pageview for no benefit (docs/plan/
 * 12-performance.md STEP D, item 3).
 */
export function CoverHero({ title, dateLabel, coverImage, priority = false }: CoverHeroProps) {
  const hasCover = !!coverImage;
  const optimizable = hasCover && isPublicCoverUrl(coverImage);
  return (
    <div className="relative flex h-48 flex-col justify-end gap-2 overflow-hidden rounded-2xl p-6 md:h-64">
      {hasCover ? (
        optimizable ? (
          <Image
            src={coverImage}
            alt=""
            fill
            // Detail pages cap content at max-w-6xl (1152px), so wide viewports
            // never show the hero at full viewport width.
            sizes="(min-width: 1152px) 1088px, 100vw"
            priority={priority}
            className="object-cover"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt=""
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )
      ) : (
        <CoverFallback tone="brand" className="absolute inset-0" />
      )}
      <span
        className={`relative w-fit rounded-full px-3 py-1 text-xs font-medium backdrop-blur ${
          hasCover ? 'bg-black/60 text-white' : 'bg-surface/80 text-text-secondary'
        }`}
      >
        {dateLabel}
      </span>
      <h1
        className={`relative text-2xl font-bold tracking-tight md:text-3xl ${
          hasCover ? 'text-white drop-shadow' : 'text-text-primary'
        }`}
      >
        {title}
      </h1>
    </div>
  );
}
