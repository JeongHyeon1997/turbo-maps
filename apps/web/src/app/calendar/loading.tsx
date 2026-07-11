import { Skeleton } from '@/components/atoms';

export default function Loading() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}
