import Link from 'next/link';

export interface FilterChipProps {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}

/** Pill-shaped filter link (e.g. category tabs) — highlighted brand fill when active. */
export function FilterChip({ href, active, children }: FilterChipProps) {
  return (
    <Link
      href={href as React.ComponentProps<typeof Link>['href']}
      aria-current={active ? 'true' : undefined}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
        active ? 'bg-brand text-white' : 'bg-surface-alt text-text-secondary hover:bg-border'
      }`}
    >
      {children}
    </Link>
  );
}
