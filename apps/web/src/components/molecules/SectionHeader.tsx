export interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
}

/** Title row with an optional trailing action. */
export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-1">
      <h2 className="text-lg font-bold text-text-primary">{title}</h2>
      {action}
    </div>
  );
}
