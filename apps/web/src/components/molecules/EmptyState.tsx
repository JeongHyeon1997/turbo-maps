export interface EmptyStateProps {
  icon?: string;
  message: string;
  action?: React.ReactNode;
}

/** Soft placeholder for a section with no content yet — never leaves a blank gap. */
export function EmptyState({ icon, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
      {icon && (
        <span className="text-3xl" aria-hidden="true">
          {icon}
        </span>
      )}
      <p className="text-sm text-text-secondary">{message}</p>
      {action}
    </div>
  );
}
