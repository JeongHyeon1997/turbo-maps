import Link from 'next/link';

export interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'ghost';
}

const base =
  'inline-flex items-center justify-center gap-1 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors';
const styles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-brand text-white hover:bg-brand-pressed',
  ghost: 'bg-surface-alt text-text-primary hover:bg-border-soft',
};

/** Pill button. Renders as a Link when href is given, else a button. */
export function Button({ children, href, variant = 'primary' }: ButtonProps) {
  const cls = `${base} ${styles[variant]}`;
  if (href) {
    return (
      <Link href={href as React.ComponentProps<typeof Link>['href']} className={cls}>
        {children}
      </Link>
    );
  }
  return <button className={cls}>{children}</button>;
}
