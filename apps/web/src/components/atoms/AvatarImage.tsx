'use client';

import { useState } from 'react';
import { AvatarFallback } from './AvatarFallback';

export interface AvatarImageProps {
  src: string;
  initial: string;
  color?: string;
}

/** Client-only image half of `Avatar` — falls back to the initial circle if the photo fails to load. */
export function AvatarImage({ src, initial, color }: AvatarImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <AvatarFallback initial={initial} color={color} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${initial} 프로필`}
      className="h-8 w-8 rounded-full object-cover ring-2 ring-background"
      onError={() => setFailed(true)}
    />
  );
}
