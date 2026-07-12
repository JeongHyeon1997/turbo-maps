import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { theme } from '@maps/tokens';
import { ScreenView, AppText, Button } from '@/components/atoms';
import { KakaoMap, type MapMarker } from '@/components/organisms';
import { useTheme } from '@/lib/theme';
import { supabase } from '@/lib/supabase';

type Phase = 'loading' | 'ready' | 'error';

interface Row {
  places: { name: string; lat: number | null; lng: number | null } | null;
}

/**
 * Map tab (docs/plan/09-mobile.md STEP 5) — mirrors web `/map`: every distinct
 * visited place across the couple's date-logs, deduped by coordinates, as
 * markers on one Kakao map (no route line — `route={false}`, same as web).
 *
 * Session guard + focus refetch/pull-to-refresh follow the same pattern as
 * `(tabs)/home.tsx` (STEP 4 reviewer follow-ups ①②, applied to every
 * data-loading tab added in STEP 5).
 */
export default function MapScreen() {
  const { colors } = useTheme();
  const [phase, setPhase] = useState<Phase>('loading');
  const [markers, setMarkers] = useState<MapMarker[]>([]);
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

    const { data, error } = await supabase.from('date_log_places').select('places(name, lat, lng)');

    if (signal.cancelled) return;

    if (error) {
      setPhase('error');
      return;
    }

    const rows = (data ?? []) as unknown as Row[];
    const seen = new Set<string>();
    const next: MapMarker[] = [];
    for (const r of rows) {
      const p = r.places;
      if (p && p.lat != null && p.lng != null) {
        const key = `${p.lat},${p.lng}`;
        if (!seen.has(key)) {
          seen.add(key);
          next.push({ lat: p.lat, lng: p.lng, name: p.name });
        }
      }
    }

    setMarkers(next);
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

  return (
    <ScreenView edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.brand} />}
      >
        <View style={styles.header}>
          <AppText variant="caption" color="secondary">
            우리가 함께 다닌
          </AppText>
          <AppText variant="displayLarge">{markers.length}곳의 지도</AppText>
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
              지도를 불러오지 못했어요.
            </AppText>
            <Button size="sm" variant="ghost" fullWidth={false} onPress={handleRetry}>
              다시 시도
            </Button>
          </View>
        )}

        {phase === 'ready' && markers.length === 0 && (
          <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <AppText variant="caption" color="secondary" style={styles.centerText}>
              아직 방문한 곳이 없어요. 기록을 추가하면 여기 지도에 모여요.
            </AppText>
          </View>
        )}

        {phase === 'ready' && markers.length > 0 && <KakaoMap markers={markers} route={false} height={440} />}
      </ScrollView>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.space[5],
    paddingTop: theme.space[4],
    paddingBottom: theme.space[8],
    gap: theme.space[4],
  },
  header: {
    gap: theme.space[1],
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[3],
    paddingVertical: theme.space[10],
  },
  emptyBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: theme.radius.xl,
    paddingVertical: theme.space[10],
    paddingHorizontal: theme.space[5],
  },
  centerText: {
    textAlign: 'center',
  },
});
