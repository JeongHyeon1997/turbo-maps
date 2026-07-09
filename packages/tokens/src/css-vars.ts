/**
 * maps (WeLog) — CSS custom-property (channel) layer for runtime theming.
 *
 * WHY: Tailwind used to bake static hex into classes at build time → no runtime
 * light/dark toggle. Instead we publish each semantic color as a **`--color-*`
 * variable holding an "R G B" channel triplet** and let Tailwind consume it via
 * `rgb(var(--color-x) / <alpha-value>)`. That keeps class NAMES unchanged
 * (`bg-brand`, `text-text-secondary`, …) AND keeps opacity utilities working
 * (`bg-background/90`, `to-brand/10`, `border-danger/30`).
 *
 * `packages/tokens` stays the single source of truth: this file derives the
 * variable maps from `colors` (light) / `colorsDark` (dark). The web injects
 * `:root` (light) + `.dark` (dark) from these maps via the Tailwind base plugin;
 * no hex is ever hand-written in globals.css. Mobile (RN) ignores this file and
 * reads the hex constants from `colors` / `theme` directly.
 */
import { colors, colorsDark, type ColorToken } from './colors';

/** `#1E7CF8` → `"30 124 248"` (space-separated channels for the rgb() slash form). */
export function hexToRgbChannels(hex: string): string {
  const h = hex.replace('#', '').trim();
  const full =
    h.length === 3
      ? h
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/**
 * Semantic color token → CSS variable name. Kept in lockstep with the Tailwind
 * `colors` map so a token and its class (`bg-<name>`) always align.
 */
const CSS_VAR_NAME: Record<ColorToken, string> = {
  brand: '--color-brand',
  brandPressed: '--color-brand-pressed',
  brandSoft: '--color-brand-soft',
  background: '--color-background',
  surface: '--color-surface',
  surfaceAlt: '--color-surface-alt',
  textPrimary: '--color-text-primary',
  textSecondary: '--color-text-secondary',
  textMuted: '--color-text-muted',
  textDisabled: '--color-text-disabled',
  textOnBrand: '--color-text-on-brand',
  border: '--color-border',
  borderStrong: '--color-border-strong',
  borderSoft: '--color-border-soft',
  divider: '--color-divider',
  danger: '--color-danger',
  success: '--color-success',
  warning: '--color-warning',
  info: '--color-info',
  rating: '--color-rating',
  inputUnderline: '--color-input-underline',
  inputUnderlineFocus: '--color-input-underline-focus',
  inputPlaceholder: '--color-input-placeholder',
};

/** All semantic color tokens paired with their CSS-var name (drives the Tailwind map). */
export const cssVarNames = CSS_VAR_NAME;

function toChannelVars(palette: Record<ColorToken, string>): Record<string, string> {
  return Object.fromEntries(
    (Object.keys(CSS_VAR_NAME) as ColorToken[]).map((k) => [
      CSS_VAR_NAME[k],
      hexToRgbChannels(palette[k]),
    ]),
  );
}

/** `:root` channel map (light). e.g. `{ '--color-brand': '30 124 248', … }` */
export const lightCssVars: Record<string, string> = toChannelVars(colors);

/** `.dark` channel map (charcoal). */
export const darkCssVars: Record<string, string> = toChannelVars(colorsDark);

/**
 * Tailwind color-value builder: a CSS-var name → the `rgb(var / <alpha-value>)`
 * string Tailwind needs so opacity utilities compose. Used in `tailwind.config`.
 */
export function withAlphaVar(varName: string): string {
  return `rgb(var(${varName}) / <alpha-value>)`;
}
