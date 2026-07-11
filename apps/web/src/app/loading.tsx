import { Skeleton } from '@/components/atoms';
import { CardGridSkeleton } from '@/components/molecules';

/** Route-level loading skeleton for `/` (feed or landing preview) — see DESIGN.md 모션 베이스라인. */
export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 md:gap-8 md:px-8 md:py-16">
      <Skeleton className="h-8 w-40" />
      <CardGridSkeleton count={3} />
    </div>
  );
}
