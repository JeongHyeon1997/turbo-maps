import { HeartRating, Tag } from '@/components/atoms';

export interface VisitedPlaceItemProps {
  /** 1-based visit order shown as a badge. */
  order: number;
  name: string;
  category?: string | null;
  address?: string | null;
  rating?: number | null;
  memo?: string | null;
}

/** One visited place row in a date-log detail: order badge, name, rating and memo. */
export function VisitedPlaceItem({
  order,
  name,
  category,
  address,
  rating,
  memo,
}: VisitedPlaceItemProps) {
  return (
    <li className="flex gap-3 rounded-2xl border border-border bg-surface p-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-alt text-sm font-bold text-brand">
        {order}
      </span>
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-text-primary">{name}</span>
            {category && <Tag>{category}</Tag>}
          </div>
          {!!rating && <HeartRating value={rating} />}
        </div>
        {address && <p className="text-xs text-text-muted">{address}</p>}
        {memo && <p className="text-sm leading-relaxed text-text-secondary">{memo}</p>}
      </div>
    </li>
  );
}
