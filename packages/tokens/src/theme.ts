/**
 * maps unified design theme.
 * All design tokens in one place. Import from `@maps/tokens` and reach in:
 *   import { theme } from '@maps/tokens';
 *   theme.color.ink, theme.font.size.lg, theme.radius.lg, ...
 *
 * Per-token re-exports (`colors`, `spacing`, `fontSize`, ...) still exist for
 * backward compatibility; new code should prefer `theme.*`.
 */
import { colors, medalPalette, territoryPalette } from './colors';
import { fontFamily, fontSize, fontWeight, lineHeight, textStyle } from './typography';
import { radius, shadow, spacing } from './spacing';

export const theme = {
  /** Color tokens — semantic + raw palettes. */
  color: {
    // Brand / surface
    primary: colors.primary,
    primaryPressed: colors.primaryPressed,
    background: colors.background,
    surface: colors.surface,
    surfaceAlt: colors.surfaceAlt,

    // Text
    ink: colors.ink,                 // #3C3C3C — Figma "black"
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
    textMuted: colors.textMuted,
    textDisabled: colors.textDisabled,
    textOnPrimary: colors.textOnPrimary,
    textOnDark: '#FEFEFE',

    // Border / divider
    border: colors.border,
    borderStrong: colors.borderStrong,
    borderSoft: colors.borderSoft,   // #EAEAEA — Figma "gray2"
    divider: colors.divider,

    // States
    danger: colors.danger,
    success: colors.success,
    warning: colors.warning,
    info: colors.info,

    // Input
    inputUnderline: colors.inputUnderline,
    inputUnderlineFocus: colors.inputUnderlineFocus,
    inputPlaceholder: colors.inputPlaceholder,

    // Territory game
    tabBarDark: colors.tabBarDark,   // #3A3A3A — bottom tab bar background
    territory: territoryPalette,
    medal: medalPalette,
  },

  /** Spacing scale (px). */
  space: spacing,

  /** Border-radius scale. */
  radius,

  /** Box-shadow scale (CSS strings). */
  shadow,

  /** Border presets used across the territory UI. */
  border: {
    soft: { width: 1, color: colors.borderSoft },
    strong: { width: 1, color: colors.borderStrong },
    divider: { width: 1, color: colors.divider },
    podium: { width: 1, color: colors.borderSoft }, // Figma cards use 1px gray2 border
  },

  /** Typography. */
  font: {
    family: fontFamily,
    size: fontSize,
    weight: fontWeight,
    lineHeight,
    style: textStyle,
    /** Figma uses -0.02em letter spacing for nearly all Korean text. */
    letterSpacingTight: '-0.02em',
  },

  /** Layout constants. */
  layout: {
    /** Mobile / web app preview column width (Figma frame is 428×926). */
    appColumnWidth: 428,
    appColumnHeight: 926,
    tabBarHeight: 92,
    tabBarNotchRadius: 50,
  },
} as const;

export type Theme = typeof theme;
