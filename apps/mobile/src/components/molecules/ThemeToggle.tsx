import { Pressable, StyleSheet, View } from 'react-native';
import { theme } from '@maps/tokens';
import { useTheme, type ThemeMode } from '@/lib/theme';
import { AppText } from '@/components/atoms';

const OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: 'system', label: '시스템' },
  { mode: 'light', label: '라이트' },
  { mode: 'dark', label: '다크' },
];

/**
 * 3-way theme segmented control (docs/plan/09-mobile.md STEP 4, consumes the
 * `ThemeProvider` from STEP 1). Mobile has no header real-estate constraint
 * like web's mobile trigger+popover variant (DESIGN.md "ThemeToggle 3-way ...
 * 확장형") — the profile screen has room for the plain inline segmented
 * control, closer to web's desktop 3-segment variant.
 */
export function ThemeToggle() {
  const { mode, setMode, colors } = useTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      style={[styles.row, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
    >
      {OPTIONS.map((option) => {
        const active = option.mode === mode;
        return (
          <Pressable
            key={option.mode}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${option.label} 테마`}
            onPress={() => setMode(option.mode)}
            style={[styles.segment, active && { backgroundColor: colors.surface }]}
          >
            <AppText
              variant="caption"
              color={active ? 'primary' : 'secondary'}
              style={active ? styles.activeLabel : undefined}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.space[1],
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.space[3],
    borderRadius: theme.radius.md,
  },
  activeLabel: {
    fontWeight: theme.font.weight.semibold,
  },
});
