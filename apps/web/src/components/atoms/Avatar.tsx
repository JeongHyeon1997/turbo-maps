import { AvatarFallback } from './AvatarFallback';
import { AvatarImage } from './AvatarImage';

export interface AvatarProps {
  initial: string;
  color?: string; // hex; falls back to brand
  imageUrl?: string | null;
  /** Diameter in px. Defaults to 32 (the original fixed size) — existing callers are unaffected. */
  size?: number;
  /** Full display name, when known, for a more meaningful accessible label/alt than the bare initial. */
  name?: string;
}

/**
 * Circular avatar. Renders a profile photo when available, else the nickname initial.
 * Stays a server component — the actual `<img onError>` handling lives in the
 * client-only `AvatarImage` atom so this can still be used from RSCs.
 */
export function Avatar({ initial, color, imageUrl, size, name }: AvatarProps) {
  if (imageUrl) {
    return <AvatarImage src={imageUrl} initial={initial} color={color} size={size} name={name} />;
  }

  return <AvatarFallback initial={initial} color={color} size={size} name={name} />;
}
