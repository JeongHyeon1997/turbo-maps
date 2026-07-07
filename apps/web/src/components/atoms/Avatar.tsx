import { AvatarFallback } from './AvatarFallback';
import { AvatarImage } from './AvatarImage';

export interface AvatarProps {
  initial: string;
  color?: string; // hex; falls back to brand
  imageUrl?: string | null;
}

/**
 * Circular avatar. Renders a profile photo when available, else the nickname initial.
 * Stays a server component — the actual `<img onError>` handling lives in the
 * client-only `AvatarImage` atom so this can still be used from RSCs.
 */
export function Avatar({ initial, color, imageUrl }: AvatarProps) {
  if (imageUrl) {
    return <AvatarImage src={imageUrl} initial={initial} color={color} />;
  }

  return <AvatarFallback initial={initial} color={color} />;
}
