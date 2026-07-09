export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

// Warm brown-tinted shadows (rgba of textPrimary #2A2521) — never pure black,
// so elevation stays soft/warm per DESIGN.md.
export const shadow = {
  none: 'none',
  sm: '0 1px 2px rgba(42,37,33,0.06)',
  md: '0 2px 8px rgba(42,37,33,0.08)',
  lg: '0 10px 28px rgba(42,37,33,0.12)',
} as const;
