export interface SkeletonProps {
  className?: string;
}

/** Shimmering placeholder box for route `loading.tsx` skeletons (DESIGN.md motion baseline — "스켈레톤 셔머" over a color flash). */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-xl bg-surface-alt ${className}`} />;
}
