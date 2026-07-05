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

// Rating / highlight tiers (repurposed from a 1-2-3 scale).
export const medalPalette = {
  1: { fill: '#FFD438', dark: '#D4A317' },
  2: { fill: '#B8AFA2', dark: '#8A8175' },
  3: { fill: '#C79A6E', dark: '#9C6F44' },
} as const;

// Back-compat alias — older imports referenced `territoryPalette`.
export const territoryPalette = accentPalette;
