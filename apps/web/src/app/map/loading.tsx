import { Skeleton } from '@/components/atoms';

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-[520px] w-full" />
    </div>
  );
}
