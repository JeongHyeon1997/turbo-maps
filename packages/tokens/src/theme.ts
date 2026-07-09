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
import { accentPalette, colors } from './colors';
import { fontFamily, fontSize, fontWeight, lineHeight, textStyle } from './typography';
import { radius, shadow, spacing } from './spacing';

export const theme = {
  /** Semantic color tokens. */
  color: {
    // Brand — WeLog blue
    brand: colors.brand,
    brandPressed: colors.brandPressed,
    brandSoft: colors.brandSoft,

    // Surface — warm cream
    background: colors.background,
    surface: colors.surface,
    surfaceAlt: colors.surfaceAlt,

    // Text
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
    textMuted: colors.textMuted,
    textDisabled: colors.textDisabled,
    textOnBrand: colors.textOnBrand,
    textOnAccent: '#FFFFFF',

    // Border / divider
    border: colors.border,
    borderStrong: colors.borderStrong,
    borderSoft: colors.borderSoft,
    divider: colors.divider,

    // States
    danger: colors.danger,
    success: colors.success,
    warning: colors.warning,
    info: colors.info,

    // Rating (romance coral) + full accent palette (tags / markers)
    rating: colors.rating,
    accent: accentPalette,

    // Input
    input: {
      underline: colors.inputUnderline,
      underlineFocus: colors.inputUnderlineFocus,
      placeholder: colors.inputPlaceholder,
    },
  },

  /** Spacing scale (px). */
  space: spacing,

  /** Border-radius scale. */
  radius,

  /** Box-shadow scale (CSS strings) — warm brown tint, never pure black. */
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
