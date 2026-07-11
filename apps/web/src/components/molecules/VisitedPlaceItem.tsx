import Link from 'next/link';
import { HeartRating, Tag } from '@/components/atoms';

export interface VisitedPlaceItemProps {
  /** 1-based visit order shown as a badge. */
  order: number;
  name: string;
  category?: string | null;
  address?: string | null;
  rating?: number | null;
  memo?: string | null;
  /**
   * When present, links the place name to its public page (`/places/[id]`) —
   * used by the public course detail (`/explore/[id]`) so visitors can hop
   * between a course and the places it visits. Renders as plain text when
   * omitted (e.g. the couple-private `/logs/[id]` doesn't need this).
   */
  placeId?: string | null;
}

/** One visited place row in a date-log detail: order badge, name, rating and memo. */
export function VisitedPlaceItem({
  order,
  name,
  category,
  address,
  rating,
  memo,
  placeId,
}: VisitedPlaceItemProps) {
  return (
    <li className="flex gap-3 rounded-2xl border border-border bg-surface p-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-alt text-sm font-bold text-brand">
        {order}
      </span>
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {placeId ? (
              <Link
                href={`/places/${placeId}` as React.ComponentProps<typeof Link>['href']}
                className="rounded text-base font-bold tracking-tight text-text-primary transition-colors duration-200 ease-out hover:text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {name}
              </Link>
            ) : (
              <span className="text-base font-bold tracking-tight text-text-primary">{name}</span>
            )}
            {category && <Tag>{category}</Tag>}
          </div>
          {!!rating && <HeartRating value={rating} />}
        </div>
        {address && <p className="text-xs text-text-secondary">{address}</p>}
        {memo && <p className="text-sm leading-relaxed text-text-secondary">{memo}</p>}
      </div>
    </li>
  );
}
