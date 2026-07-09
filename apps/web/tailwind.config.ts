import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
import { theme, cssVarNames, lightCssVars, darkCssVars, withAlphaVar } from '@maps/tokens';

// Single semantic source: colors resolve to `rgb(var(--color-*) / <alpha-value>)`
// so class NAMES stay stable (`bg-brand`, `text-text-secondary`, …) AND opacity
// utilities keep working (`bg-background/90`, `to-brand/10`). The `:root`/`.dark`
// channel values are injected below from @maps/tokens — no raw hex in this file.
const v = cssVarNames;
const color = (name: string) => withAlphaVar(name);

export default {
  content: ['./src/**/*.{ts,tsx}'],
  // Runtime theme toggle: web-dev flips `<html class="dark">` (see 08 B2).
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand
        brand: color(v.brand),
        'brand-pressed': color(v.brandPressed),
        'brand-soft': color(v.brandSoft),

        // Surface
        background: color(v.background),
        surface: color(v.surface),
        'surface-alt': color(v.surfaceAlt),

        // Text
        'text-primary': color(v.textPrimary),
        'text-secondary': color(v.textSecondary),
        'text-muted': color(v.textMuted),
        'text-disabled': color(v.textDisabled),
        'text-on-brand': color(v.textOnBrand),

        // Border / divider
        border: color(v.border),
        'border-strong': color(v.borderStrong),
        'border-soft': color(v.borderSoft),
        divider: color(v.divider),

        // States
        danger: color(v.danger),
        success: color(v.success),
        warning: color(v.warning),
        info: color(v.info),

        // Rating (romance coral, themed)
        rating: color(v.rating),

        // Accents — retired rainbow, now a static neutral/brand ramp (being
        // migrated away; not runtime-themed on purpose).
        'accent-coral': theme.color.accent.coral,
        'accent-sage': theme.color.accent.sage,
        'accent-lavender': theme.color.accent.lavender,
        'accent-amber': theme.color.accent.amber,
        'accent-sky': theme.color.accent.sky,

        // Input
        'input-placeholder': color(v.inputPlaceholder),
        'input-underline': color(v.inputUnderline),
      },
      borderRadius: {
        sm: `${theme.radius.sm}px`,
        md: `${theme.radius.md}px`,
        lg: `${theme.radius.lg}px`,
        xl: `${theme.radius.xl}px`,
        '2xl': `${theme.radius['2xl']}px`,
      },
      boxShadow: {
        sm: theme.shadow.sm,
        md: theme.shadow.md,
        lg: theme.shadow.lg,
      },
      spacing: Object.fromEntries(
        Object.entries(theme.space).map(([k, val]) => [k, `${val}px`]),
      ),
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        // Logo wordmark only (BMJUA, self-hosted via `--font-jua`). `logo` is an
        // alias of `jua` so either class works; use `font-jua` on `<Logo>` only.
        jua: ['var(--font-jua)', 'Pretendard', 'sans-serif'],
        logo: ['var(--font-jua)', 'Pretendard', 'sans-serif'],
      },
      letterSpacing: {
        tight: theme.font.letterSpacingTight,
      },
    },
  },
  plugins: [
    // Publish semantic palette as CSS variables: `:root` (light) + `.dark`.
    // Values come from @maps/tokens channel maps (single source of truth).
    plugin(({ addBase }) => {
      addBase({
        ':root': { colorScheme: 'light', ...lightCssVars },
        '.dark': { colorScheme: 'dark', ...darkCssVars },
      });
    }),
  ],
} satisfies Config;
