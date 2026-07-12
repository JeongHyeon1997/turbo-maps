import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { theme } from '@maps/tokens';
import { ScreenView, AppText, Button } from '@/components/atoms';
import { DateLogCard, type DateLogCardData } from '@/components/molecules';
import { useTheme } from '@/lib/theme';
import { supabase } from '@/lib/supabase';

type Phase = 'loading' | 'ready' | 'error';

interface DateLogRow {
  id: string;
  date: string;
  title: string | null;
  memo: string | null;
  cover_photo_path: string | null;
  date_log_places: {
    visit_order: number;
    rating: number | null;
    places: { name: string; category: string | null } | null;
  }[];
}

/** Mirrors web `apps/web/src/app/page.tsx` `toCard` — same shaping, RN card shape. */
function toCardData(row: DateLogRow, coverUrl: string | null): DateLogCardData {
  const places = [...(row.date_log_places ?? [])].sort((a, b) => a.visit_order - b.visit_order);
  const ratings = places.map((p) => p.rating ?? 0).filter((r) => r > 0);
  const avgRating = ratings.length ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;

  return {
    id: row.id,
    date: row.date,
    title: row.title ?? '무제 데이트',
    memo: row.memo ?? '',
    rating: avgRating,
    places: places.map((p) => ({ name: p.places?.name ?? '', category: p.places?.category ?? '' })),
    coverImage: coverUrl,
  };
}

/**
 * Home feed tab (docs/plan/09-mobile.md STEP 4/5) — mirrors web home feed's
 * signed-in branch: couple-scoped `date_logs` (RLS scopes the plain select to
 * the caller's own couple, no explicit `couple_id` filter needed — same as
 * web) + signed cover-photo URLs (private `date-photos` bucket). Cards now
 * navigate to `/logs/[id]` (STEP 5 — the detail route didn't exist at STEP 4).
 *
 * STEP 4 reviewer follow-ups (STEP 5 scope):
 * ① session guard — `supabase.auth.getUser()` runs before the `date_logs`
 *    query and redirects to `/login` on an expired/cleared session, mirroring
 *    `(tabs)/profile.tsx`'s existing guard (this screen had none before).
 * ② freshness — `useFocusEffect` reloads whenever this tab regains focus
 *    (e.g. after visiting a detail screen), plus pull-to-refresh.
 */
export default function HomeScreen() {
  const { colors } = useTheme();
  const [phase, setPhase] = useState<Phase>('loading');
  const [logs, setLogs] = useState<DateLogCardData[]>([]);
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

    const { data: rows, error } = await supabase
      .from('date_logs')
      .select(
        'id, date, title, memo, cover_photo_path, date_log_places(visit_order, rating, places(name, category))',
      )
      .order('date', { ascending: false });

    if (signal.cancelled) return;

    if (error) {
      setPhase('error');
      return;
    }

    const typed = (rows ?? []) as unknown as DateLogRow[];
    const paths = typed.map((r) => r.cover_photo_path).filter((p): p is string => !!p);

    const signed = new Map<string, string>();
    if (paths.length > 0) {
      const { data: urls } = await supabase.storage.from('date-photos').createSignedUrls(paths, 3600);
      if (signal.cancelled) return;
      urls?.forEach((u) => {
        if (u.path && u.signedUrl) signed.set(u.path, u.signedUrl);
      });
    }

    setLogs(typed.map((r) => toCardData(r, r.cover_photo_path ? (signed.get(r.cover_photo_path) ?? null) : null)));
    setPhase('ready');
  }, []);

  useFocusEffect(
    useCallback(() => {
      const signal = { cancelled: false };
      // Only force the full-screen "불러오는 중…" state on first load — a
      // refocus with an existing list refreshes silently in the background.
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

  return (
    // Bottom safe-area is the tab bar's job (react-navigation insets it itself) —
    // excluding it here avoids double bottom padding.
    <ScreenView edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <AppText variant="caption" color="secondary">
          우리가 함께한 날
        </AppText>
        <AppText variant="displayLarge">{logs.length}개의 기록</AppText>
      </View>

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
            기록을 불러오지 못했어요.
          </AppText>
          <Button size="sm" variant="ghost" fullWidth={false} onPress={handleRetry}>
            다시 시도
          </Button>
        </View>
      )}

      {phase === 'ready' && logs.length === 0 && (
        <View style={styles.center}>
          <AppText variant="body" color="secondary">
            아직 기록이 없어요.
          </AppText>
        </View>
      )}

      {phase === 'ready' && logs.length > 0 && (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: '/logs/[id]', params: { id: item.id } })}
              accessibilityRole="button"
              accessibilityLabel={`${item.title} 기록 상세 보기`}
            >
              <DateLogCard log={item} />
            </Pressable>
          )}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.brand} />}
        />
      )}
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.space[5],
    paddingTop: theme.space[4],
    paddingBottom: theme.space[2],
    gap: theme.space[1],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[3],
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.space[5],
    paddingBottom: theme.space[6],
  },
  separator: {
    height: theme.space[4],
  },
});
