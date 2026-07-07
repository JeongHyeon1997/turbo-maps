import Link from 'next/link';

export interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'ghost';
  /** Native button type. Ignored when `href` is set. Defaults to `'button'` (never accidentally submits a form). */
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  /** Stretches the button to fill its container's width. */
  fullWidth?: boolean;
  /** Marks the button busy (disables it + `aria-busy`) without changing its label — callers keep controlling their own "저장 중…" text. */
  loading?: boolean;
  onClick?: () => void;
}

const base =
  'inline-flex items-center justify-center gap-1 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60';
const styles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-brand text-white hover:bg-brand-pressed',
  ghost: 'bg-surface-alt text-text-primary hover:bg-border-soft',
};

/** Pill button. Renders as a Link when href is given, else a button. */
export function Button({
  children,
  href,
  variant = 'primary',
  type = 'button',
  disabled,
  fullWidth,
  loading,
  onClick,
}: ButtonProps) {
  const cls = `${base} ${styles[variant]} ${fullWidth ? 'w-full' : ''}`;
  if (href) {
    return (
      <Link href={href as React.ComponentProps<typeof Link>['href']} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onClick={onClick}
      className={cls}
    >
      {children}
    </button>
  );
}
