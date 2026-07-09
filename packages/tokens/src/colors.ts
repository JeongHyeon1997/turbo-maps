/**
 * maps (WeLog) design tokens — raw color palette.
 *
 * Direction: warm / personal — a cream "paper" canvas with a blue "ink" brand,
 * echoing the WeLog notebook logo (warm cream + blue accent reads like a diary
 * written in blue pen). This file is the RAW value source; the semantic layer
 * that apps consume lives in `theme.ts`. See DESIGN.md for rationale + contrast.
 */
export const colors = {
  // Brand — WeLog blue (sampled from the logo notebook outline)
  brand: '#1E7CF8',
  brandPressed: '#135FD6',
  brandSoft: '#E9F1FE', // tint for hover / selected surfaces

  // Surface — warm cream canvas
  background: '#FFFBF5',
  surface: '#FBF5EC',
  surfaceAlt: '#F4ECDF',

  // Text — warm neutral (espresso → taupe)
  textPrimary: '#2A2521',
  textSecondary: '#6A6058',
  textMuted: '#9A9086',
  textDisabled: '#C4BCB0',
  textOnBrand: '#FFFFFF',

  // Border / divider
  border: '#E9E0D3',
  borderStrong: '#D6CBB9',
  borderSoft: '#EFE7DA',
  divider: '#F1EADE',

  // States
  danger: '#D0453C',
  success: '#2F9E5B',
  warning: '#DE912F',
  info: '#1E7CF8', // aligns with the brand blue

  // Rating — warm coral heart/star (romance accent, distinct from brand)
  rating: '#F26B60',

  // Input
  inputUnderline: '#E5DCCD',
  inputUnderlineFocus: '#1E7CF8',
  inputPlaceholder: '#B3A99C',
} as const;

export type ColorToken = keyof typeof colors;

// Accent palette — tags / markers (e.g. place categories on the map).
// Warm, softened hues; `coral` doubles as the rating color for a unified voice.
export const accentPalette = {
  coral: '#F26B60',
  sage: '#83AC83',
  lavender: '#AE93DB',
  amber: '#E7A23F',
  sky: '#6FAEE6',
} as const;

export type AccentColor = (typeof accentPalette)[keyof typeof accentPalette];

/**
 * Cover gradient tints — the light (top-left) stop of each date-log cover
 * gradient. Warm-leaning pastels that pair 1:1 with `accentPalette` as the
 * dark (bottom-right) stop. Named by hue so consumers read intent, not hex.
 */
export const coverTints = {
  peach: '#F8C9AC', // pairs with accentPalette.coral
  mint: '#BCE3BD', // pairs with accentPalette.sage
  lilac: '#D6C4EC', // pairs with accentPalette.lavender
  honey: '#FBE0A6', // pairs with accentPalette.amber
  powder: '#BEDFF4', // pairs with accentPalette.sky
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
