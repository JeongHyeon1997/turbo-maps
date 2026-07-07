'use client';

import { useState } from 'react';
import { AvatarFallback } from './AvatarFallback';

export interface AvatarImageProps {
  src: string;
  initial: string;
  color?: string;
  /** Diameter in px. Defaults to 32 (the original fixed size) — existing callers are unaffected. */
  size?: number;
  /** Full display name, when known, for a more meaningful `alt` than the bare initial. */
  name?: string;
}

/** Client-only image half of `Avatar` — falls back to the initial circle if the photo fails to load. */
export function AvatarImage({ src, initial, color, size = 32, name }: AvatarImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <AvatarFallback initial={initial} color={color} size={size} name={name} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name ? `${name} 프로필 사진` : `${initial} 프로필 사진`}
      className="rounded-full object-cover ring-2 ring-background"
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
}
