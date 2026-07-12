import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { theme } from '@maps/tokens';
import { useTheme } from '@/lib/theme';

export interface CoverFallbackProps {
  style?: StyleProp<ViewStyle>;
  /** Visual weight of the fallback plane — `neutral` (default) for feed/card contexts. */
  tone?: 'neutral' | 'brand';
}

/**
 * Photo-less cover placeholder — mirrors web `CoverFallback` atom (a single
 * quiet plane + neutral pin icon, DESIGN.md "커버 폴백 단순화"). Purely
 * decorative; callers always pair it with real text (date/title) elsewhere.
 */
export function CoverFallback({ style, tone = 'neutral' }: CoverFallbackProps) {
  const { colors } = useTheme();
  const bg = tone === 'brand' ? colors.brandSoft : colors.surfaceAlt;
  const iconColor = tone === 'brand' ? colors.brand : colors.textMuted;

  return (
    <View style={[styles.base, { backgroundColor: bg }, style]}>
      <Svg width={theme.space[8]} height={theme.space[8]} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={1.5}>
        <Rect x={3} y={4} width={18} height={16} rx={2} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={9} cy={10} r={1.5} fill={iconColor} />
        <Path d="M4 17l5-5a2 2 0 0 1 2.8 0L18 18" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
