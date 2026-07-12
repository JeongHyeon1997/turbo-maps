import { Tabs } from 'expo-router';
import { theme } from '@maps/tokens';
import { useTheme } from '@/lib/theme';
import { Icon } from '@/components/atoms';

// Same stroke-path convention as web `BottomNav`'s inline `I(d)` helper
// (apps/web/src/components/organisms/BottomNav.tsx) — IA mirrored 1:1
// (home/map/calendar/profile; web's 5th "기록" FAB slot is `/logs/new`,
// STEP 6 — not part of the mobile tab set yet).
const TAB_ICON_PATH = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  map: 'M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3zM9 3v15M15 6v15',
  calendar: 'M7 2v4M17 2v4M3.5 10h17M4 4h16v16H4V4z',
  profile: 'M12 12a5 5 0 100-10 5 5 0 000 10zM3 21.5a9 9 0 0118 0',
} as const;

/**
 * Bottom tab shell (docs/plan/09-mobile.md STEP 4) — mirrors web `BottomNav`'s
 * IA. `map`/`calendar` screens are placeholders until STEP 5 fleshes them out
 * (WebView map, monthly calendar); the tab bar itself is the STEP 4 deliverable.
 */
export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: theme.border.divider.width,
          borderTopColor: colors.divider,
        },
        tabBarLabelStyle: {
          fontSize: theme.font.size.xs,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '홈',
          tabBarIcon: ({ color, size }) => <Icon path={TAB_ICON_PATH.home} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: '지도',
          tabBarIcon: ({ color, size }) => <Icon path={TAB_ICON_PATH.map} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '캘린더',
          tabBarIcon: ({ color, size }) => <Icon path={TAB_ICON_PATH.calendar} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '프로필',
          tabBarIcon: ({ color, size }) => <Icon path={TAB_ICON_PATH.profile} color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
