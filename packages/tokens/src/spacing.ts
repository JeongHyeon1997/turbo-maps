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

// Faint neutral-tinted shadows (rgba of textPrimary #1F1D1B) — never pure black,
// so elevation stays soft per DESIGN.md (warm-neutral minimalism). In dark mode
// depth comes from stepped surface elevation, not these shadows.
export const shadow = {
  none: 'none',
  sm: '0 1px 2px rgba(31,29,27,0.06)',
  md: '0 2px 8px rgba(31,29,27,0.08)',
  lg: '0 10px 28px rgba(31,29,27,0.12)',
} as const;
