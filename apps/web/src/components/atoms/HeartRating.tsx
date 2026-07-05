export interface HeartRatingProps {
  value: number; // 0-5
  max?: number;
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 ${filled ? 'text-brand' : 'text-border'}`}
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 21s-7.5-4.35-10-9.28C.36 8.28 2 5 5.2 5c1.9 0 3.2 1.1 3.8 2.1h.02C10.6 6.1 11.9 5 13.8 5 17 5 18.64 8.28 17 11.72 14.5 16.65 12 21 12 21z" />
    </svg>
  );
}

/** Rating rendered as filled hearts — fits the warm/couple tone. */
export function HeartRating({ value, max = 5 }: HeartRatingProps) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`평점 ${value} / ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <Heart key={i} filled={i < value} />
      ))}
    </div>
  );
}
