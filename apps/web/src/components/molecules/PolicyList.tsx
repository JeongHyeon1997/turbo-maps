export interface PolicyListProps {
  items: React.ReactNode[];
}

/** Bulleted enumeration used inside a PolicySection (e.g. collected-data items, opt-out links). */
export function PolicyList({ items }: PolicyListProps) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-text-muted">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
