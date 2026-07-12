import { Text, type TextProps } from 'react-native';
import { theme } from '@maps/tokens';
import { useTheme } from '@/lib/theme';

export type AppTextVariant = keyof typeof theme.font.style;

export type AppTextColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'disabled'
  | 'onBrand'
  | 'brand'
  | 'danger'
  | 'success';

export interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  color?: AppTextColor;
}

/**
 * Typography atom — consumes `theme.font.style.*` (fontSize/weight/lineHeight,
 * shared across light/dark) and resolves `color` against the active theme's
 * semantic color object (`useTheme().colors`, swaps light/dark).
 *
 * `fontFamily` is intentionally NOT set here: `theme.font.family` holds a
 * CSS font-stack string (web-only, self-hosted via next/font). Mobile has no
 * Pretendard binary loaded yet (no `useFonts` wiring) — that's a follow-up,
 * not STEP 1 scope — so text falls back to the OS system font for now.
 */
export function AppText({
  variant = 'body',
  color = 'primary',
  style,
  ...rest
}: AppTextProps) {
  const { colors } = useTheme();
  const variantStyle = theme.font.style[variant];

  const colorMap: Record<AppTextColor, string> = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    muted: colors.textMuted,
    disabled: colors.textDisabled,
    onBrand: colors.textOnBrand,
    brand: colors.brand,
    danger: colors.danger,
    success: colors.success,
  };

  return (
    <Text
      style={[
        {
          fontSize: variantStyle.fontSize,
          fontWeight: variantStyle.fontWeight,
          lineHeight: variantStyle.fontSize * variantStyle.lineHeight,
          color: colorMap[color],
        },
        style,
      ]}
      {...rest}
    />
  );
}
