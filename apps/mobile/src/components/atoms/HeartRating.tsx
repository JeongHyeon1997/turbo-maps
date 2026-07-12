import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from '@maps/tokens';
import { useTheme } from '@/lib/theme';

export interface HeartRatingProps {
  /** 0-5. */
  value: number;
  max?: number;
}

const HEART_PATH =
  'M12 21s-7.5-4.35-10-9.28C.36 8.28 2 5 5.2 5c1.9 0 3.2 1.1 3.8 2.1h.02C10.6 6.1 11.9 5 13.8 5 17 5 18.64 8.28 17 11.72 14.5 16.65 12 21 12 21z';
// Icon glyph size, independent of the spacing scale (same rationale as `Icon`'s `size` default).
const HEART_SIZE = 16;

/**
 * Rating rendered as filled hearts — mirrors web `HeartRating` atom, but uses
 * `colors.rating` (not `colors.brand`) for the filled state per DESIGN.md
 * "역할 분리: 블루=인터랙션, coral=rating(애정)만" (the coral rating token).
 */
export function HeartRating({ value, max = 5 }: HeartRatingProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.row} accessibilityLabel={`평점 ${value} / ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <Svg key={i} width={HEART_SIZE} height={HEART_SIZE} viewBox="0 0 24 24">
          <Path d={HEART_PATH} fill={i < value ? colors.rating : colors.border} />
        </Svg>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[1],
  },
});
