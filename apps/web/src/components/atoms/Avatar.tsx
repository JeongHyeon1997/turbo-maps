export interface AvatarProps {
  initial: string;
  color?: string; // hex; falls back to brand
}

/** Circular initial avatar. Placeholder until profile photos land. */
export function Avatar({ initial, color }: AvatarProps) {
  return (
    <span
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white ring-2 ring-background"
      style={{ backgroundColor: color ?? '#E8635C' }}
    >
      {initial}
    </span>
  );
}
