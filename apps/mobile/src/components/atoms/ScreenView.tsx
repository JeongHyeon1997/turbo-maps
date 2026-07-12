import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme';

export interface ScreenViewProps extends ViewProps {
  /** SafeArea edges to inset. Defaults to all four. */
  edges?: readonly Edge[];
}

/** Full-screen wrapper — SafeArea insets + theme background. Every screen root uses this. */
export function ScreenView({ style, edges, children, ...rest }: ScreenViewProps) {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      edges={edges ?? ['top', 'right', 'bottom', 'left']}
      style={[styles.base, { backgroundColor: colors.background }, style]}
      {...rest}
    >
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1 },
  content: { flex: 1 },
});
