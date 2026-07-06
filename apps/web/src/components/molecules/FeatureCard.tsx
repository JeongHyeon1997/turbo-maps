export interface FeatureCardProps {
  /** Emoji glyph — keeps the landing page dependency-free (no icon set yet). */
  icon: string;
  title: string;
  description: string;
}

/** One value-prop tile in the landing page's feature grid. */
export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6">
      <span className="text-3xl" aria-hidden="true">
        {icon}
      </span>
      <h3 className="text-base font-bold text-text-primary">{title}</h3>
      <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
    </div>
  );
}
