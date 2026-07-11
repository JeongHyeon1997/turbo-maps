import { Skeleton } from '@/components/atoms';
import { CardGridSkeleton } from '@/components/molecules';

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 md:px-8 md:py-16">
      <div className="flex flex-col gap-5">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-14 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
        <CardGridSkeleton />
      </div>
    </div>
  );
}
