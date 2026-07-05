export interface TagProps {
  children: React.ReactNode;
}

/** Small category chip. Warm surface pill. */
export function Tag({ children }: TagProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-surface-alt px-3 py-1 text-xs font-medium text-text-secondary">
      {children}
    </span>
  );
}
