import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { theme } from '@maps/tokens';
import { ScreenView, AppText, Button } from '@/components/atoms';
import { CalendarView, type CalendarItem } from '@/components/organisms';
import { useTheme } from '@/lib/theme';
import { supabase } from '@/lib/supabase';

type Phase = 'loading' | 'ready' | 'error';

interface Row {
  id: string;
  date: string;
  title: string | null;
  date_log_places: { id: string }[];
}

/**
 * Calendar tab (docs/plan/09-mobile.md STEP 5) — mirrors web `/calendar`:
 * every date-log plotted on a month calendar, tap a day to list its logs, tap
 * a log to open its detail (`/logs/[id]`).
 *
 * Session guard + focus refetch/pull-to-refresh follow the same pattern as
 * `(tabs)/home.tsx` (STEP 4 reviewer follow-ups ①②, applied to every
 * data-loading tab added in STEP 5).
 */
export default function CalendarScreen() {
  const { colors } = useTheme();
  const [phase, setPhase] = useState<Phase>('loading');
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (signal: { cancelled: boolean }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (signal.cancelled) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    const { data, error } = await supabase
      .from('date_logs')
      .select('id, date, title, date_log_places(id)')
      .order('date', { ascending: false });

    if (signal.cancelled) return;

    if (error) {
      setPhase('error');
      return;
    }

    const rows = (data ?? []) as unknown as Row[];
    setItems(
      rows.map((r) => ({
        id: r.id,
        date: r.date.slice(0, 10),
        title: r.title ?? '무제 데이트',
        placeCount: r.date_log_places?.length ?? 0,
      })),
    );
    setPhase('ready');
  }, []);

  useFocusEffect(
    useCallback(() => {
      const signal = { cancelled: false };
      setPhase((prev) => (prev === 'ready' ? prev : 'loading'));
      load(signal);
      return () => {
        signal.cancelled = true;
      };
    }, [load]),
  );

  const handleRefresh = useCallback(() => {
    const signal = { cancelled: false };
    setRefreshing(true);
    load(signal).finally(() => setRefreshing(false));
  }, [load]);

  const handleRetry = useCallback(() => {
    const signal = { cancelled: false };
    setPhase('loading');
    load(signal);
  }, [load]);

  const initialMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  return (
    <ScreenView edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.brand} />}
      >
        <AppText variant="title">캘린더</AppText>

        {phase === 'loading' && (
          <View style={styles.center}>
            <AppText variant="caption" color="secondary">
              불러오는 중…
            </AppText>
          </View>
        )}

        {phase === 'error' && (
          <View style={styles.center}>
            <AppText variant="caption" color="danger">
              캘린더를 불러오지 못했어요.
            </AppText>
            <Button size="sm" variant="ghost" fullWidth={false} onPress={handleRetry}>
              다시 시도
            </Button>
          </View>
        )}

        {phase === 'ready' && <CalendarView items={items} initialMonth={initialMonth} />}
      </ScrollView>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.space[5],
    paddingTop: theme.space[4],
    paddingBottom: theme.space[8],
    gap: theme.space[5],
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[3],
    paddingVertical: theme.space[10],
  },
});
