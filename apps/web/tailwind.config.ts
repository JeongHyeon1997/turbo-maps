import type { Config } from 'tailwindcss';
import { theme } from '@maps/tokens';

// Single semantic source: Tailwind classes are generated from `theme.color.*`
// (assembled in packages/tokens/src/theme.ts). No raw hex here.
const c = theme.color;

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand
        brand: c.brand,
        'brand-pressed': c.brandPressed,
        'brand-soft': c.brandSoft,

        // Surface
        background: c.background,
        surface: c.surface,
        'surface-alt': c.surfaceAlt,

        // Text
        'text-primary': c.textPrimary,
        'text-secondary': c.textSecondary,
        'text-muted': c.textMuted,

        // Border / divider
        border: c.border,
        'border-strong': c.borderStrong,
        'border-soft': c.borderSoft,
        divider: c.divider,

        // States
        danger: c.danger,
        success: c.success,
        warning: c.warning,
        info: c.info,

        // Rating + accents
        rating: c.rating,
        'accent-coral': c.accent.coral,
        'accent-sage': c.accent.sage,
        'accent-lavender': c.accent.lavender,
        'accent-amber': c.accent.amber,
        'accent-sky': c.accent.sky,

        // Input
        'input-placeholder': c.input.placeholder,
        'input-underline': c.input.underline,
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
        Object.entries(theme.space).map(([k, v]) => [k, `${v}px`]),
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
      },
      letterSpacing: {
        tight: theme.font.letterSpacingTight,
      },
    },
  },
  plugins: [],
} satisfies Config;
