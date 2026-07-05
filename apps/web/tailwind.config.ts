import type { Config } from 'tailwindcss';
import { colors, radius, spacing } from '@maps/tokens';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: colors.primary,
        'brand-pressed': colors.primaryPressed,
        surface: colors.surface,
        'surface-alt': colors.surfaceAlt,
        'text-primary': colors.textPrimary,
        'text-secondary': colors.textSecondary,
        'text-muted': colors.textMuted,
        border: colors.border,
        divider: colors.divider,
        ink: colors.ink,
        'tab-bar-dark': colors.tabBarDark,
        'border-soft': colors.borderSoft,
        'input-placeholder': colors.inputPlaceholder,
        'input-underline': colors.inputUnderline,
        danger: colors.danger,
      },
      borderRadius: {
        sm: `${radius.sm}px`,
        md: `${radius.md}px`,
        lg: `${radius.lg}px`,
        xl: `${radius.xl}px`,
      },
      spacing: Object.fromEntries(
        Object.entries(spacing).map(([k, v]) => [k, `${v}px`]),
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
    },
  },
  plugins: [],
} satisfies Config;
