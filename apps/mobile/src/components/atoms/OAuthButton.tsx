import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { theme } from '@maps/tokens';
import { AppText } from './AppText';

export interface OAuthButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  /**
   * This button's own request is in flight — shows a spinner instead of the
   * label and skips the disabled-dim treatment (it's clearly busy, not
   * merely inactive). A sibling button that's `disabled` but not `loading`
   * still dims, so the two read as "this one is working" vs. "this one is
   * blocked for now".
   */
  loading?: boolean;
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
export function OAuthButton({
  label,
  onPress,
  disabled,
  loading,
  bg,
  fg = '#FFFFFF',
}: OAuthButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          opacity: loading ? 1 : disabled ? 0.6 : pressed ? 0.85 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <AppText variant="button" style={{ color: fg }}>
          {label}
        </AppText>
      )}
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
