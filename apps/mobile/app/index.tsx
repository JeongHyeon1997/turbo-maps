import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@maps/tokens';

// Entry screen. app-dev builds out (auth)/(tabs) route groups per DESIGN.md.
export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>maps</Text>
      <Text style={styles.tagline}>커플의 데이트 · 맛집 · 경로 기록</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: 8,
  },
  logo: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
