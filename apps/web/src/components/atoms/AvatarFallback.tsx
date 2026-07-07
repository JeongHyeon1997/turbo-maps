import { accentPalette } from '@maps/tokens';

export interface AvatarFallbackProps {
  initial: string;
  color?: string; // hex; falls back to brand
}

/** Initial-letter circle shown when there's no photo, or a photo failed to load. */
export function AvatarFallback({ initial, color }: AvatarFallbackProps) {
  return (
    <span
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white ring-2 ring-background"
      style={{ backgroundColor: color ?? accentPalette.coral }}
    >
      {initial}
    </span>
  );
}
