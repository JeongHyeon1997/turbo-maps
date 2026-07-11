import Link from 'next/link';

export interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'ghost';
  /**
   * `lg` (56, main CTA) / `md` (48, default) / `sm` (40, inline/secondary) —
   * see DESIGN.md "Button — size 스펙". `lg` defaults to `fullWidth` unless
   * `fullWidth` is explicitly passed. Buttons are always rectangular
   * (rounded-xl/lg) — pill shape is reserved for chips/filters/badges.
   */
  size?: 'lg' | 'md' | 'sm';
  /** Native button type. Ignored when `href` is set. Defaults to `'button'` (never accidentally submits a form). */
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  /** Stretches the button to fill its container's width. Defaults to `true` for `size="lg"`, else `false`. */
  fullWidth?: boolean;
  /** Marks the button busy (disables it + `aria-busy`) without changing its label — callers keep controlling their own "저장 중…" text. */
  loading?: boolean;
  onClick?: () => void;
}

const base =
  'inline-flex items-center justify-center gap-1.5 font-semibold transition-all duration-200 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100';

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-brand text-white hover:bg-brand-pressed',
  ghost: 'bg-surface-alt text-text-primary hover:bg-border-soft',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  lg: 'h-14 rounded-xl px-6 text-base',
  md: 'h-12 rounded-lg px-5 text-sm',
  sm: 'h-10 rounded-lg px-4 text-sm',
};

/** Renders as a Link when href is given, else a native button. Rectangular rounding by size (see DESIGN.md). */
export function Button({
  children,
  href,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled,
  fullWidth,
  loading,
  onClick,
}: ButtonProps) {
  const isFullWidth = fullWidth ?? size === 'lg';
  const cls = `${base} ${variantStyles[variant]} ${sizeStyles[size]} ${isFullWidth ? 'w-full' : ''}`;
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
