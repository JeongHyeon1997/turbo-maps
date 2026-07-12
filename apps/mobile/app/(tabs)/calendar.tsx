import { StyleSheet, View } from 'react-native';
import { theme } from '@maps/tokens';
import { ScreenView, AppText } from '@/components/atoms';

/**
 * Calendar tab placeholder — the tab shell itself is the STEP 4 deliverable
 * (docs/plan/09-mobile.md). The monthly-fold calendar view is STEP 5 scope;
 * this screen only reserves the route so the tab bar has somewhere real to land.
 */
export default function CalendarScreen() {
  return (
    <ScreenView edges={['top', 'left', 'right']}>
      <View style={styles.center}>
        <AppText variant="title">캘린더</AppText>
        <AppText variant="caption" color="secondary">
          월별 기록이 곧 여기로 연결돼요 (STEP 5).
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
