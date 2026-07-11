/**
 * maps (WeLog) design tokens — raw color palette.
 *
 * Direction: **warm-neutral minimalism (Toss-like)**. A warm off-white canvas
 * with **white cards** stacked on top (surface separation, not background hue),
 * a single **brand blue** for every interaction (link / CTA / active / focus),
 * and warm-leaning neutral grays for text. `coral` is demoted to **rating only**
 * (hearts / stars). See DESIGN.md for rationale + contrast.
 *
 * This file is the RAW value source. The semantic layer apps consume lives in
 * `theme.ts`; the runtime light/dark CSS-variable channels live in `css-vars.ts`.
 *
 * `colors` = LIGHT palette (also the default JS constant that mobile / RN read,
 * since RN can't consume CSS variables). `colorsDark` = the charcoal dark set;
 * the web publishes both as `--color-*` channels and flips via `.dark`.
 */
export const colors = {
  // Brand — WeLog blue (the single interaction color).
  brand: '#1E7CF8',
  brandPressed: '#135FD6',
  brandSoft: '#E9F1FE', // tint for hover / selected / soft-fill surfaces

  // Surface — warm off-white canvas + WHITE cards (Toss-style plane split).
  background: '#F7F5F1', // canvas (a "board", slightly under white)
  surface: '#FFFFFF', // white card on the canvas
  surfaceAlt: '#EFECE6', // recessed / input track / secondary plane

  // Text — warm neutral gray (brown removed, only warmth retained).
  textPrimary: '#1F1D1B', // ~15:1 on background (AA large + body)
  textSecondary: '#5C5852', // ~6.5:1 on background (AA body)
  textMuted: '#8A857E', // ~3.36:1 on background (measured) — meta / non-essential (AA large; NOT sufficient for regular-size body copy)
  textDisabled: '#B8B4AD',
  textOnBrand: '#FFFFFF',

  // Border / divider — neutral warm gray.
  border: '#E6E3DD',
  borderStrong: '#D2CEC6',
  borderSoft: '#EDE9E3',
  divider: '#F1EEE9',

  // States
  danger: '#D0453C',
  success: '#2F9E5B',
  warning: '#DE912F',
  info: '#1E7CF8', // aligns with the brand blue

  // Rating — warm coral heart/star. THE romance accent; never an interaction color.
  rating: '#F26B60',

  // Input
  inputUnderline: '#E6E3DD',
  inputUnderlineFocus: '#1E7CF8',
  inputPlaceholder: '#A8A39B',
} as const;

export type ColorToken = keyof typeof colors;

/**
 * DARK palette — **neutral charcoal (Toss-like), not warm brown.**
 * Stepped elevation (bg → surface → surfaceAlt gets lighter), no pure black,
 * brand lifted for contrast, text as solid equivalents of the .92/.60/.40 white
 * tiers (solids keep Tailwind alpha utilities — `text-x/70` — working, since the
 * channels feed `rgb(var(--color-x) / <alpha-value>)`).
 */
export const colorsDark = {
  brand: '#4B9BFF',
  brandPressed: '#3A82E0',
  brandSoft: '#1B2740', // dark blue-charcoal for hover / selected

  background: '#17171A', // no pure black
  surface: '#1F1F24', // +1 elevation
  surfaceAlt: '#26262C', // +2 elevation

  textPrimary: '#EDEDED', // ≈ rgba(255,255,255,.92)
  textSecondary: '#A1A1A6', // ≈ .60
  textMuted: '#6E6E73', // ≈ .40 (AA large)
  textDisabled: '#55555A',
  textOnBrand: '#FFFFFF',

  border: '#2E2E33', // ≈ white .10 overlay on charcoal
  borderStrong: '#3A3A40',
  borderSoft: '#252529',
  divider: '#232328', // ≈ white .06

  danger: '#FF6B60',
  success: '#3DBB72',
  warning: '#F0A83C',
  info: '#4B9BFF',

  rating: '#FF7A6F', // slightly brighter for dark contrast

  inputUnderline: '#2E2E33',
  inputUnderlineFocus: '#4B9BFF',
  inputPlaceholder: '#6E6E73',
} as const satisfies Record<ColorToken, string>;

export type ColorsDark = typeof colorsDark;

/**
 * Accent palette — tags / markers (place categories on the map).
 *
 * **Rainbow retired (2026-07).** Reduced to a restrained warm-neutral tonal ramp
 * + brand. Categories are distinguished by **tone / icon / label / surface**, not
 * hue. `coral` is NOT here anymore (it's `rating` only). Keys are kept stable for
 * back-compat until consumers (KakaoMap route, AvatarFallback, AppShell partner
 * colors) migrate to brand/neutral — see 08 risk #2 (don't delete before swap).
 */
export const accentPalette = {
  coral: '#736E67', // was coral → dark warm gray
  sage: '#8E8A83',
  lavender: '#A29E97',
  amber: '#B8B4AD', // lightest warm gray
  sky: '#1E7CF8', // the one accent that stays "colored" = brand
} as const;

export type AccentColor = (typeof accentPalette)[keyof typeof accentPalette];

// Cover gradients/tints (the 5-hue rainbow photo-less fallback) were retired
// 2026-07 — replaced by the `CoverFallback` atom (apps/web), a single
// surfaceAlt/brandSoft plane + icon (DESIGN.md "커버 폴백 단순화"). Every
// consumer (`page.tsx`, `lib/explore.ts`, `lib/places.ts`, `lib/mock/date-logs.ts`,
// `DateLogCard`) migrated off `coverGradients`/`coverTints` before this export
// was removed (08 risk #2, order enforced) — do not re-add without a component
// to justify it.
