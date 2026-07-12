import { redirect } from 'next/navigation';
import { createClient, getUser } from '@/lib/supabase/server';
import { AppShell } from '@/components/templates';
import { KakaoMap, type MapMarker } from '@/components/organisms';
import { PageTitle } from '@/components/atoms';

interface Row {
  places: { name: string; lat: number | null; lng: number | null } | null;
}

export default async function MapPage() {
  const user = await getUser();
  if (!user) redirect('/login');
  const supabase = await createClient();

  const { data } = await supabase.from('date_log_places').select('places(name, lat, lng)');
  const rows = (data ?? []) as unknown as Row[];

  const seen = new Set<string>();
  const markers: MapMarker[] = [];
  for (const r of rows) {
    const p = r.places;
    if (p && p.lat != null && p.lng != null) {
      const key = `${p.lat},${p.lng}`;
      if (!seen.has(key)) {
        seen.add(key);
        markers.push({ lat: p.lat, lng: p.lng, name: p.name });
      }
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-text-secondary">우리가 함께 다닌</p>
          <PageTitle className="text-2xl md:text-4xl">{markers.length}곳의 지도</PageTitle>
        </div>
        {markers.length > 0 ? (
          <KakaoMap markers={markers} route={false} height={520} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center text-sm text-text-secondary">
            아직 방문한 곳이 없어요. 기록을 추가하면 여기 지도에 모여요.
          </div>
        )}
      </div>
    </AppShell>
  );
}
