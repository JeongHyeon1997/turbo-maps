/**
 * maps 디자인 토큰 - 컬러
 * 방향: 따뜻하고 개인적인(warm/personal) 톤 — 크림 배경 + 코랄 액센트.
 * 정식 팔레트/근거는 DESIGN.md, 확정은 designer 역할이 관리.
 */
export const colors = {
  // Brand — warm coral
  primary: '#E8635C',
  primaryPressed: '#C94E48',

  // Surface — warm cream canvas
  background: '#FFFCF7',
  surface: '#FBF6EE',
  surfaceAlt: '#F3ECE0',

  // Text — warm neutral
  textPrimary: '#2B2622',
  textSecondary: '#6B6259',
  textMuted: '#9C9288',
  textDisabled: '#C7BFB4',
  textOnPrimary: '#FFFFFF',

  // Border / divider
  border: '#EAE1D4',
  borderStrong: '#D8CDBC',
  divider: '#F0E9DD',

  // States
  danger: '#D64545',
  success: '#3C9A5F',
  warning: '#E0912F',
  info: '#3A7BD5',

  // Input
  inputUnderline: '#E5DCCD',
  inputUnderlineFocus: '#E8635C',
  inputPlaceholder: '#B5AB9E',

  // Misc neutrals (kept for token compatibility)
  ink: '#2B2622',
  borderSoft: '#EFE7DA',
  tabBarDark: '#2B2622',
} as const;

export type ColorToken = keyof typeof colors;

// Accent palette — used for tags/markers (e.g. place categories on the map).
// Repurpose freely; designer finalizes semantics in DESIGN.md.
export const accentPalette = {
  coral: '#E8635C',
  sage: '#8FB08A',
  lavender: '#B79BD9',
  amber: '#E7A54B',
  sky: '#7FB4E0',
} as const;

export type AccentColor = (typeof accentPalette)[keyof typeof accentPalette];

/**
 * Cover gradient tints — the light (top-left) stop of each date-log cover
 * gradient. Warm-leaning pastels that pair 1:1 with `accentPalette` as the
 * dark (bottom-right) stop. Named by hue so consumers read intent, not hex.
 */
export const coverTints = {
  peach: '#F6C6A8', // pairs with accentPalette.coral
  mint: '#BFE3C0', // pairs with accentPalette.sage
  lilac: '#D9C6EE', // pairs with accentPalette.lavender
  honey: '#FCE1A8', // pairs with accentPalette.amber
  powder: '#BFE0F5', // pairs with accentPalette.sky
} as const;

export type CoverTint = (typeof coverTints)[keyof typeof coverTints];

/**
 * Date-log cover gradients — the photo-less fallback for a date-log card cover.
 * Each pair is `[from, to]`: a warm light tint → its accent counterpart, meant
 * to be rendered as a linear gradient (e.g. top-left → bottom-right).
 * Single source of truth; do not hard-code these pairs in apps.
 */
export const coverGradients = [
  [coverTints.peach, accentPalette.coral],
  [coverTints.mint, accentPalette.sage],
  [coverTints.lilac, accentPalette.lavender],
  [coverTints.honey, accentPalette.amber],
  [coverTints.powder, accentPalette.sky],
] as const satisfies readonly (readonly [from: string, to: string])[];

/** A single `[from, to]` cover-gradient stop pair. */
export type CoverGradient = readonly [from: string, to: string];

// Rating / highlight tiers (repurposed from a 1-2-3 scale).
export const medalPalette = {
  1: { fill: '#FFD438', dark: '#D4A317' },
  2: { fill: '#B8AFA2', dark: '#8A8175' },
  3: { fill: '#C79A6E', dark: '#9C6F44' },
} as const;

// Back-compat alias — older imports referenced `territoryPalette`.
export const territoryPalette = accentPalette;
