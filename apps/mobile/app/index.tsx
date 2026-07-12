import { StyleSheet, View } from 'react-native';
import { theme } from '@maps/tokens';
import { ScreenView, AppText } from '@/components/atoms';

// Entry screen. app-dev builds out (auth)/(tabs) route groups per DESIGN.md.
export default function Home() {
  return (
    <ScreenView>
      <View style={styles.center}>
        <AppText variant="displayLarge" color="brand">
          위로그
        </AppText>
        <AppText variant="caption" color="secondary">
          커플의 데이트 · 맛집 · 경로 기록
        </AppText>
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[2],
  },
});
