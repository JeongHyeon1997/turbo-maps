/**
 * maps (WeLog) unified design theme — the single SEMANTIC layer.
 *
 * Raw values live in `colors.ts` / `spacing.ts` / `typography.ts`; this file
 * assembles them into the semantic names apps actually consume. It is the one
 * entry point — `tailwind.config.ts` reads `theme.color.*` to generate classes,
 * and non-Tailwind consumers (RN, inline styles) reach in the same way:
 *
 *   import { theme } from '@maps/tokens';
 *   theme.color.brand, theme.color.textPrimary, theme.radius.lg, ...
 *
 * Per-token re-exports (`colors`, `spacing`, `fontSize`, ...) still exist for
 * direct access; prefer `theme.*` for anything semantic.
 */
import { accentPalette, colors, colorsDark } from './colors';
import { fontFamily, fontSize, fontWeight, lineHeight, textStyle } from './typography';
import { radius, shadow, spacing } from './spacing';

/**
 * Assemble a semantic color layer from a raw palette. `theme.color` is the LIGHT
 * set (also the constant RN reads). `theme.colorDark` is the charcoal set. The
 * web publishes both as `--color-*` channels (see `css-vars.ts`) and toggles via
 * `.dark`; keys are identical across the two so class names stay stable.
 */
function semanticColor(p: typeof colors | typeof colorsDark) {
  return {
    brand: p.brand,
    brandPressed: p.brandPressed,
    brandSoft: p.brandSoft,

    background: p.background,
    surface: p.surface,
    surfaceAlt: p.surfaceAlt,

    textPrimary: p.textPrimary,
    textSecondary: p.textSecondary,
    textMuted: p.textMuted,
    textDisabled: p.textDisabled,
    textOnBrand: p.textOnBrand,
    textOnAccent: '#FFFFFF',

    border: p.border,
    borderStrong: p.borderStrong,
    borderSoft: p.borderSoft,
    divider: p.divider,

    danger: p.danger,
    success: p.success,
    warning: p.warning,
    info: p.info,

    rating: p.rating,
    accent: accentPalette,

    input: {
      underline: p.inputUnderline,
      underlineFocus: p.inputUnderlineFocus,
      placeholder: p.inputPlaceholder,
    },
  } as const;
}

export const theme = {
  /** Semantic color tokens — LIGHT (warm neutral). Also the RN default constant. */
  color: semanticColor(colors),

  /** Semantic color tokens — DARK (neutral charcoal). Same keys as `color`. */
  colorDark: semanticColor(colorsDark),

  /** Spacing scale (px). */
  space: spacing,

  /** Border-radius scale. */
  radius,

  /** Box-shadow scale (CSS strings) — faint neutral tint, never pure black.
   *  Dark mode expresses depth via stepped surface elevation, not shadow. */
  shadow,

  /** Border presets (width + color) for RN / inline use. */
  border: {
    soft: { width: 1, color: colors.borderSoft },
    strong: { width: 1, color: colors.borderStrong },
    divider: { width: 1, color: colors.divider },
  },

  /** Typography. */
  font: {
    family: fontFamily,
    size: fontSize,
    weight: fontWeight,
    lineHeight,
    style: textStyle,
    /** Tight tracking for Korean headings / titles (not body/caption). */
    letterSpacingTight: '-0.02em',
  },
} as const;

export type Theme = typeof theme;
