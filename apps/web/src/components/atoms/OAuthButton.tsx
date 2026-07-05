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
      className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold transition-opacity disabled:opacity-60"
      style={{ backgroundColor: bg, color: fg }}
    >
      {label}
    </button>
  );
}
