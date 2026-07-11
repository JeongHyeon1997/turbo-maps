import { CoverFallback } from '@/components/atoms';

export interface CoverHeroProps {
  title: string;
  dateLabel: string;
  coverImage?: string | null;
}

/**
 * Large detail-page cover (course/date-log hero): real photo when present, else
 * `CoverFallback`. Text treatment flips with it — white-on-photo needs the
 * scrim/drop-shadow it already had, but that same white would fail contrast on
 * the plain neutral fallback plane, so the no-photo path switches to solid
 * foreground tokens instead (DESIGN.md risk #4 — dark-mode/no-photo contrast).
 * Shared by `/explore/[id]` and `/logs/[id]` (was duplicated between them).
 */
export function CoverHero({ title, dateLabel, coverImage }: CoverHeroProps) {
  const hasCover = !!coverImage;
  return (
    <div className="relative flex h-48 flex-col justify-end gap-2 overflow-hidden rounded-2xl p-6 md:h-64">
      {hasCover ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${coverImage})` }}
        />
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
