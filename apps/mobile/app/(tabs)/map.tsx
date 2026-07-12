import { StyleSheet, View } from 'react-native';
import { theme } from '@maps/tokens';
import { ScreenView, AppText } from '@/components/atoms';

/**
 * Map tab placeholder — the tab shell itself is the STEP 4 deliverable
 * (docs/plan/09-mobile.md). The full Kakao Map WebView (marker view of every
 * visited place) is STEP 5 scope; this screen only reserves the route so the
 * tab bar has somewhere real to land.
 */
export default function MapScreen() {
  return (
    <ScreenView edges={['top', 'left', 'right']}>
      <View style={styles.center}>
        <AppText variant="title">지도</AppText>
        <AppText variant="caption" color="secondary">
          전체 지도가 곧 여기로 연결돼요 (STEP 5).
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
