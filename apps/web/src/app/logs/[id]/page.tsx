import { notFound, redirect } from 'next/navigation';
import { createClient, getUser } from '@/lib/supabase/server';
import { AppShell } from '@/components/templates';
import { KakaoMap, PhotoGallery, type MapMarker } from '@/components/organisms';
import { BackLink, HeartRating } from '@/components/atoms';
import { CoverHero, VisitedPlaceItem } from '@/components/molecules';
import { formatLogDate } from '@/lib/format-date';

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
  // one-to-one via a unique FK, but PostgREST may still shape it as an array.
  routes: RouteRow | RouteRow[] | null;
}

function isCoordList(v: unknown): v is { lat: number; lng: number }[] {
  return (
    Array.isArray(v) &&
    v.every((p) => p && typeof p === 'object' && 'lat' in p && 'lng' in p)
  );
}

export default async function DateLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser();
  if (!user) redirect('/login');
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('date_logs')
    .select(
      'id, date, title, memo, cover_photo_path, author_id, date_log_places(visit_order, rating, memo, places(name, category, address, lat, lng)), routes(coordinates)',
    )
    .eq('id', id)
    .maybeSingle();

  if (error || !data) notFound();

  const row = data as unknown as Row;

  const places = [...(row.date_log_places ?? [])].sort((a, b) => a.visit_order - b.visit_order);
  const ratings = places.map((p) => p.rating ?? 0).filter((r) => r > 0);
  const avgRating = ratings.length
    ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length)
    : 0;

  // Independent reads — parallelized instead of a serial waterfall
  // (docs/plan/12-performance.md STEP C, item 6). Only `galleryUrls` has a real
  // dependency (needs `photoRows` first), so that one stays sequential below.
  const [signedCover, { data: photoRows }, { data: author }] = await Promise.all([
    row.cover_photo_path
      ? supabase.storage.from('date-photos').createSignedUrl(row.cover_photo_path, 3600)
      : Promise.resolve({ data: null }),
    supabase
      .from('date_log_photos')
      .select('storage_path')
      .eq('date_log_id', id)
      .order('sort_order', { ascending: true }),
    supabase.from('profiles').select('nickname').eq('id', row.author_id).maybeSingle(),
  ]);
  const coverUrl = signedCover.data?.signedUrl ?? null;

  const photoPaths = (photoRows ?? []).map((r) => r.storage_path as string);
  let galleryUrls: string[] = [];
  if (photoPaths.length > 0) {
    const { data: signedPhotos } = await supabase.storage
      .from('date-photos')
      .createSignedUrls(photoPaths, 3600);
    const signedMap = new Map<string, string>();
    signedPhotos?.forEach((u) => {
      if (u.path && u.signedUrl) signedMap.set(u.path, u.signedUrl);
    });
    // Preserve sort_order — createSignedUrls doesn't guarantee response order.
    galleryUrls = photoPaths
      .map((p) => signedMap.get(p))
      .filter((u): u is string => !!u);
  }

  const routeRow = Array.isArray(row.routes) ? row.routes[0] : row.routes;
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

  return (
    <AppShell>
      <div className="flex flex-col gap-6 md:gap-8">
        <BackLink fallbackHref="/">‹ 피드로 돌아가기</BackLink>

        <CoverHero
          title={row.title ?? '무제 데이트'}
          dateLabel={formatLogDate(row.date)}
          coverImage={coverUrl}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          {avgRating > 0 && <HeartRating value={avgRating} />}
          {author?.nickname && <p className="text-sm text-text-secondary">by {author.nickname}</p>}
        </div>

        {row.memo && (
          <p className="whitespace-pre-line rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-text-secondary">
            {row.memo}
          </p>
        )}

        {markers.length > 0 && <KakaoMap markers={markers} height={320} />}

        {places.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-text-primary">방문한 곳</h2>
            <ul className="flex flex-col gap-3">
              {places.map((p, i) => (
                <VisitedPlaceItem
                  key={`${p.visit_order}-${i}`}
                  order={i + 1}
                  name={p.places?.name ?? '이름 없는 장소'}
                  category={p.places?.category}
                  address={p.places?.address}
                  rating={p.rating}
                  memo={p.memo}
                />
              ))}
            </ul>
          </div>
        )}

        {galleryUrls.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-text-primary">사진</h2>
            <PhotoGallery urls={galleryUrls} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
