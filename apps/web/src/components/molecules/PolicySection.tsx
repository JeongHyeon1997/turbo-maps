export interface PolicySectionProps {
  title: string;
  children: React.ReactNode;
}

/** One numbered heading + prose body block, reused across /privacy and /terms. */
export function PolicySection({ title, children }: PolicySectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-text-primary">{title}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-text-secondary">
        {children}
      </div>
    </section>
  );
}
