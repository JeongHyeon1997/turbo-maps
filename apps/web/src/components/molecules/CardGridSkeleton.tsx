import { Skeleton } from '@/components/atoms';

export interface CardGridSkeletonProps {
  /** Number of placeholder cards. Defaults to 6 (roughly a first paint's worth). */
  count?: number;
}

/** Loading placeholder matching the DateLogCard/PlaceCard grid shape — used by route `loading.tsx` files. */
export function CardGridSkeleton({ count = 6 }: CardGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-border bg-surface">
          <Skeleton className="h-40 rounded-none" />
          <div className="flex flex-col gap-3 p-4">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
