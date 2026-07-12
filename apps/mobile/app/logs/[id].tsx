import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { theme } from '@maps/tokens';
import { useTheme } from '@/lib/theme';
import { ScreenView, AppText, BackLink, HeartRating, Button } from '@/components/atoms';
import { CoverHero, VisitedPlaceItem } from '@/components/molecules';
import { KakaoMap, PhotoGallery, type MapMarker } from '@/components/organisms';
import { supabase } from '@/lib/supabase';
import { formatLogDate } from '@/lib/format-date';

type Phase = 'loading' | 'ready' | 'error' | 'not-found';

interface PlaceRow {
  name: string;
  category: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
}

interface DateLogPlaceRow {
  visit_order: number;
  rating: number | null;
  memo: string | null;
  places: PlaceRow | null;
}

interface RouteRow {
  coordinates: unknown;
}

interface Row {
  id: string;
  date: string;
  title: string | null;
  memo: string | null;
  cover_photo_path: string | null;
  author_id: string;
  date_log_places: DateLogPlaceRow[];
  // one-to-one via a unique FK, but PostgREST may still shape it as an array
  // (mirrors web `apps/web/src/app/logs/[id]/page.tsx`'s same comment).
  routes: RouteRow | RouteRow[] | null;
}

interface DetailPlace {
  order: number;
  name: string;
  category: string | null;
  address: string | null;
  rating: number | null;
  memo: string | null;
}

interface DetailData {
  title: string;
  dateLabel: string;
  coverUrl: string | null;
  memo: string | null;
  avgRating: number;
  authorNickname: string | null;
  places: DetailPlace[];
  markers: MapMarker[];
  galleryUrls: string[];
}

function isCoordList(v: unknown): v is { lat: number; lng: number }[] {
  return Array.isArray(v) && v.every((p) => p && typeof p === 'object' && 'lat' in p && 'lng' in p);
}

/**
 * Date-log detail (docs/plan/09-mobile.md STEP 5) — mirrors web `/logs/[id]`:
 * cover hero, rating/author, memo, route/marker map, visited-place list, and
 * the photo gallery. Read-only (Phase 1 excludes `/logs/new` — STEP 6).
 *
 * Session guard mirrors `(tabs)/profile.tsx`'s `getUser()` check (STEP 4
 * reviewer follow-up ①, applied to every data-loading screen added in this
 * STEP): an expired/cleared session redirects to `/login` instead of letting
 * the query run (and RLS silently return nothing). Refetch mirrors follow-up
 * ② — `useFocusEffect` reloads on every return to this screen (e.g. after a
 * theme change elsewhere), plus pull-to-refresh.
 */
export default function DateLogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [phase, setPhase] = useState<Phase>('loading');
  const [data, setData] = useState<DetailData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (signal: { cancelled: boolean }) => {
      if (!id) {
        setPhase('not-found');
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (signal.cancelled) return;
      if (!user) {
        router.replace('/login');
        return;
      }

      const { data: row, error } = await supabase
        .from('date_logs')
        .select(
          'id, date, title, memo, cover_photo_path, author_id, date_log_places(visit_order, rating, memo, places(name, category, address, lat, lng)), routes(coordinates)',
        )
        .eq('id', id)
        .maybeSingle();

      if (signal.cancelled) return;

      if (error) {
        setPhase('error');
        return;
      }
      if (!row) {
        setPhase('not-found');
        return;
      }

      const typedRow = row as unknown as Row;
      const places = [...(typedRow.date_log_places ?? [])].sort((a, b) => a.visit_order - b.visit_order);
      const ratings = places.map((p) => p.rating ?? 0).filter((r) => r > 0);
      const avgRating = ratings.length ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;

      const [signedCover, { data: photoRows }, { data: author }] = await Promise.all([
        typedRow.cover_photo_path
          ? supabase.storage.from('date-photos').createSignedUrl(typedRow.cover_photo_path, 3600)
          : Promise.resolve({ data: null }),
        supabase
          .from('date_log_photos')
          .select('storage_path')
          .eq('date_log_id', id)
          .order('sort_order', { ascending: true }),
        supabase.from('profiles').select('nickname').eq('id', typedRow.author_id).maybeSingle(),
      ]);

      if (signal.cancelled) return;

      const coverUrl = signedCover.data?.signedUrl ?? null;

      const photoPaths = (photoRows ?? []).map((r) => r.storage_path as string);
      let galleryUrls: string[] = [];
      if (photoPaths.length > 0) {
        const { data: signedPhotos } = await supabase.storage.from('date-photos').createSignedUrls(photoPaths, 3600);
        if (signal.cancelled) return;
        const signedMap = new Map<string, string>();
        signedPhotos?.forEach((u) => {
          if (u.path && u.signedUrl) signedMap.set(u.path, u.signedUrl);
        });
        // Preserve sort_order — createSignedUrls doesn't guarantee response order.
        galleryUrls = photoPaths.map((p) => signedMap.get(p)).filter((u): u is string => !!u);
      }

      const routeRow = Array.isArray(typedRow.routes) ? typedRow.routes[0] : typedRow.routes;
      const coords = isCoordList(routeRow?.coordinates) ? routeRow.coordinates : null;

      const markers: MapMarker[] = coords
        ? coords.map((c, i) => ({ lat: c.lat, lng: c.lng, name: places[i]?.places?.name }))
        : places
            .filter((p) => p.places?.lat != null && p.places?.lng != null)
            .map((p) => ({
              lat: p.places!.lat as number,
              lng: p.places!.lng as number,
              name: p.places!.name,
            }));

      setData({
        title: typedRow.title ?? '무제 데이트',
        dateLabel: formatLogDate(typedRow.date),
        coverUrl,
        memo: typedRow.memo,
        avgRating,
        authorNickname: author?.nickname ?? null,
        places: places.map((p, i) => ({
          order: i + 1,
          name: p.places?.name ?? '이름 없는 장소',
          category: p.places?.category ?? null,
          address: p.places?.address ?? null,
          rating: p.rating,
          memo: p.memo,
        })),
        markers,
        galleryUrls,
      });
      setPhase('ready');
    },
    [id],
  );

  useFocusEffect(
    useCallback(() => {
      const signal = { cancelled: false };
      // Only force the full-screen "불러오는 중…" state on first load — a
      // refocus with existing data refreshes silently in the background.
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
    <ScreenView edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.brand} />}
      >
        <BackLink fallbackHref="/home">‹ 피드로 돌아가기</BackLink>

        {phase === 'loading' && (
          <View style={styles.center}>
            <AppText variant="caption" color="secondary">
              불러오는 중…
            </AppText>
          </View>
        )}

        {(phase === 'error' || phase === 'not-found') && (
          <View style={styles.center}>
            <AppText variant="caption" color="danger">
              {phase === 'not-found' ? '기록을 찾을 수 없어요.' : '기록을 불러오지 못했어요.'}
            </AppText>
            {phase === 'error' && (
              <Button size="sm" variant="ghost" fullWidth={false} onPress={handleRetry}>
                다시 시도
              </Button>
            )}
          </View>
        )}

        {phase === 'ready' && data && (
          <>
            <CoverHero title={data.title} dateLabel={data.dateLabel} coverImage={data.coverUrl} />

            <View style={styles.metaRow}>
              {data.avgRating > 0 && <HeartRating value={data.avgRating} />}
              {data.authorNickname && (
                <AppText variant="caption" color="secondary">
                  by {data.authorNickname}
                </AppText>
              )}
            </View>

            {!!data.memo && (
              <View style={[styles.memoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <AppText variant="body" color="secondary">
                  {data.memo}
                </AppText>
              </View>
            )}

            {data.markers.length > 0 && <KakaoMap markers={data.markers} height={220} />}

            {data.places.length > 0 && (
              <View style={styles.section}>
                <AppText variant="subtitle">방문한 곳</AppText>
                <View style={styles.placeList}>
                  {data.places.map((p) => (
                    <VisitedPlaceItem
                      key={p.order}
                      order={p.order}
                      name={p.name}
                      category={p.category}
                      address={p.address}
                      rating={p.rating}
                      memo={p.memo}
                    />
                  ))}
                </View>
              </View>
            )}

            {data.galleryUrls.length > 0 && (
              <View style={styles.section}>
                <AppText variant="subtitle">사진</AppText>
                <PhotoGallery urls={data.galleryUrls} />
              </View>
            )}
          </>
        )}
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
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space[2],
  },
  memoBox: {
    borderWidth: 1,
    borderRadius: theme.radius.xl,
    padding: theme.space[4],
  },
  section: {
    gap: theme.space[3],
  },
  placeList: {
    gap: theme.space[3],
  },
});
