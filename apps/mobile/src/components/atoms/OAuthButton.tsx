import { Pressable, StyleSheet } from 'react-native';
import { theme } from '@maps/tokens';
import { AppText } from './AppText';

export interface OAuthButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  /**
   * Raw hex — these are third-party brand colors (e.g. Kakao's mandated
   * `#FEE500`/`#191600`, Google's fixed white button), not `@maps/tokens`
   * semantic values, so they're passed in by the caller instead of coming
   * from a `variant`. Same exception the web `OAuthButton` atom takes
   * (`apps/web/src/components/atoms/OAuthButton.tsx`).
   */
  bg: string;
  fg?: string;
}

/** Full-width social sign-in button — mirrors the web `OAuthButton` atom. */
export function OAuthButton({ label, onPress, disabled, bg, fg = '#FFFFFF' }: OAuthButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          opacity: disabled ? 0.6 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <AppText variant="button" style={{ color: fg }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    // Matches Button `size="lg"` (56 = 48+8) per DESIGN.md.
    height: theme.space[12] + theme.space[2],
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.space[6],
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
