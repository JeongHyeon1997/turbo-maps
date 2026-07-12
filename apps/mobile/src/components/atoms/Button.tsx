import { Pressable, StyleSheet, type PressableProps, type ViewStyle } from 'react-native';
import { theme } from '@maps/tokens';
import { useTheme } from '@/lib/theme';
import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'ghost';
export type ButtonSize = 'lg' | 'md' | 'sm';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  children: string;
  variant?: ButtonVariant;
  /**
   * `lg` (56, main CTA) / `md` (48, default) / `sm` (40, inline/secondary) —
   * mirrors DESIGN.md "Button — size 스펙". Buttons stay rectangular
   * (never pill — pill is reserved for chips/filters/badges).
   */
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

// Heights/paddings are derived from `theme.space` steps (not raw literals) to
// land on the DESIGN.md size ranges: lg 56 (48+8), md 48, sm 40.
const sizeConfig = {
  lg: {
    height: theme.space[12] + theme.space[2],
    paddingHorizontal: theme.space[6],
    borderRadius: theme.radius.xl,
    fontSize: theme.font.size.base,
  },
  md: {
    height: theme.space[12],
    paddingHorizontal: theme.space[5],
    borderRadius: theme.radius.lg,
    fontSize: theme.font.size.sm,
  },
  sm: {
    height: theme.space[10],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius.md,
    fontSize: theme.font.size.sm,
  },
} as const satisfies Record<ButtonSize, { height: number; paddingHorizontal: number; borderRadius: number; fontSize: number }>;

// Minimum 44px touch target (accessibility) even where the visual height (sm = 40)
// dips below it — expand the hit area with `hitSlop` instead of the visible box.
const MIN_TOUCH_TARGET = 44;

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled,
  style,
  hitSlop,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const config = sizeConfig[size];
  const extraHit = Math.max(0, Math.ceil((MIN_TOUCH_TARGET - config.height) / 2));

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={hitSlop ?? (extraHit > 0 ? extraHit : undefined)}
      style={({ pressed }) => [
        styles.base,
        {
          height: config.height,
          paddingHorizontal: config.paddingHorizontal,
          borderRadius: config.borderRadius,
          backgroundColor: variant === 'primary' ? colors.brand : colors.surfaceAlt,
          opacity: disabled ? 0.6 : pressed ? 0.85 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
      {...rest}
    >
      <AppText
        color={variant === 'primary' ? 'onBrand' : 'primary'}
        style={{ fontSize: config.fontSize, fontWeight: theme.font.weight.semibold }}
      >
        {children}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
