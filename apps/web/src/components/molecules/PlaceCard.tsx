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
      className="block"
    >
      <article className="flex flex-col gap-2 rounded-2xl border border-border bg-background p-4 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-text-primary">{place.name}</h3>
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
