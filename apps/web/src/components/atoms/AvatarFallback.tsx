import { accentPalette } from '@maps/tokens';

export interface AvatarFallbackProps {
  initial: string;
  color?: string; // hex; falls back to brand
  /** Diameter in px. Defaults to 32 (the original fixed size) — existing callers are unaffected. */
  size?: number;
  /** Full display name, when known, for a more meaningful accessible label than the bare initial. */
  name?: string;
}

/** Initial-letter circle shown when there's no photo, or a photo failed to load. */
export function AvatarFallback({ initial, color, size = 32, name }: AvatarFallbackProps) {
  return (
    <span
      role="img"
      aria-label={name ? `${name} 프로필` : `${initial} 이니셜 아바타`}
      className="inline-flex items-center justify-center rounded-full font-semibold text-white ring-2 ring-background"
      style={{
        backgroundColor: color ?? accentPalette.coral,
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4375),
      }}
    >
      <span aria-hidden="true">{initial}</span>
    </span>
  );
}
