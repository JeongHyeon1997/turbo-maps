'use client';

export interface RatingInputProps {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}

/** Clickable heart rating (0–max). Click the same heart again to clear it. */
export function RatingInput({ value, onChange, max = 5 }: RatingInputProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        return (
          <button
            key={n}
            type="button"
            aria-label={`${n}점`}
            onClick={() => onChange(value === n ? 0 : n)}
            className="rounded-full transition-transform duration-200 ease-out active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <svg
              viewBox="0 0 24 24"
              className={`h-6 w-6 transition-colors duration-200 ease-out ${n <= value ? 'text-brand' : 'text-border'}`}
              fill="currentColor"
            >
              <path d="M12 21s-7.5-4.35-10-9.28C.36 8.28 2 5 5.2 5c1.9 0 3.2 1.1 3.8 2.1h.02C10.6 6.1 11.9 5 13.8 5 17 5 18.64 8.28 17 11.72 14.5 16.65 12 21 12 21z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
