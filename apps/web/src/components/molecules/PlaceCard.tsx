import Link from 'next/link';
import { Tag, HeartRating } from '@/components/atoms';
import type { PublicPlace } from '@/lib/places';

export interface PlaceCardProps {
  place: PublicPlace;
}

/** One place entry in the `/places` directory: name, category, address, aggregate rating and public visit count. Links to `/places/[id]`. */
export function PlaceCard({ place }: PlaceCardProps) {
  return (
    <Link
      href={`/places/${place.id}` as React.ComponentProps<typeof Link>['href']}
      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <article className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 transition-all duration-200 ease-out hover:border-border-strong">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold tracking-tight text-text-primary">{place.name}</h3>
          {place.avgRating > 0 && <HeartRating value={Math.round(place.avgRating)} />}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {place.category && <Tag>{place.category}</Tag>}
          <span className="text-xs text-text-muted">공개 코스 {place.publicLogCount}건</span>
        </div>
        {place.address && <p className="text-xs text-text-muted">{place.address}</p>}
      </article>
    </Link>
  );
}
