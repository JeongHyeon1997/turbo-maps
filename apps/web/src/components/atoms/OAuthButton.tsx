export interface OAuthButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  bg: string;
  fg?: string;
}

/** Full-width social sign-in button. Brand color passed in by the caller. */
export function OAuthButton({ label, onClick, disabled, bg, fg = '#ffffff' }: OAuthButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold transition-all duration-200 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-60 disabled:active:scale-100"
      style={{ backgroundColor: bg, color: fg }}
    >
      {label}
    </button>
  );
}
