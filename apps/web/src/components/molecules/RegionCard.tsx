import Link from 'next/link';
import type { PublicRegion } from '@/lib/regions';

export interface RegionCardProps {
  region: PublicRegion;
}

/** One region entry in the `/explore/regions` index: name + place/course counts. Links to `/explore/regions/[region]`. */
export function RegionCard({ region }: RegionCardProps) {
  return (
    <Link
      href={
        `/explore/regions/${encodeURIComponent(region.region)}` as React.ComponentProps<
          typeof Link
        >['href']
      }
      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <article className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 transition-all duration-200 ease-out hover:border-border-strong dark:border-border-strong">
        <h3 className="text-base font-bold tracking-tight text-text-primary">{region.region}</h3>
        <p className="text-xs text-text-muted">
          장소 {region.placeCount}곳 · 공개 코스 {region.publicLogCount}건
        </p>
      </article>
    </Link>
  );
}
