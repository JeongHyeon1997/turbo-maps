import { accentPalette } from '@maps/tokens';

export interface AvatarProps {
  initial: string;
  color?: string; // hex; falls back to brand
  imageUrl?: string | null;
}

/** Circular avatar. Renders a profile photo when available, else the nickname initial. */
export function Avatar({ initial, color, imageUrl }: AvatarProps) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={initial}
        className="h-8 w-8 rounded-full object-cover ring-2 ring-background"
      />
    );
  }

  return (
    <span
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white ring-2 ring-background"
      style={{ backgroundColor: color ?? accentPalette.coral }}
    >
      {initial}
    </span>
  );
}
