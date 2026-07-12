import { StyleSheet, View } from 'react-native';
import { theme } from '@maps/tokens';
import { useTheme } from '@/lib/theme';
import { AppText } from './AppText';

export interface TagProps {
  children: string;
}

/** Small category chip — mirrors web `Tag` atom (warm surface pill). */
export function Tag({ children }: TagProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.base, { backgroundColor: colors.surfaceAlt }]}>
      <AppText variant="caption" color="secondary" style={styles.label}>
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.space[3],
    paddingVertical: theme.space[1],
  },
  label: {
    fontSize: theme.font.size.xs,
  },
});
