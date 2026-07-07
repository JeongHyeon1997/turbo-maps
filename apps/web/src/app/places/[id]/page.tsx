import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { AppShell, PublicShell } from '@/components/templates';
import { KakaoMap, type MapMarker, DateLogFeed } from '@/components/organisms';
import { BackLink, HeartRating, JsonLd, Tag } from '@/components/atoms';
import { EmptyState } from '@/components/molecules';
import { getPublicPlace, getPublicPlaceLogs } from '@/lib/places';
import { SITE_URL } from '@/lib/site-url';

// Public place page — reachable signed out (`/places` prefix is public, see
// middleware.ts). Reads only the anon-safe `explore_places` / `explore_place_logs`
// views (0008), never base tables (`places`, `date_logs`), so memo/private cover/
// real nicknames can't leak here regardless of session state (see
// docs/plan/05-public-enrichment.md B). Do not add a query against `places`,
// `date_logs` or `date_log_places` to this file.

interface PageParams {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const place = await getPublicPlace(supabase, id);
  if (!place) return {};

  const logs = await getPublicPlaceLogs(supabase, id);
  const coverImage = logs.find((l) => !!l.coverImage)?.coverImage ?? undefined;

  const parts = [place.category, place.address].filter((v): v is string => !!v);
  const description = `${parts.length > 0 ? `${parts.join(' · ')} — ` : ''}익명 커플들의 공개 데이트 코스 ${place.publicLogCount}건에 등장한 장소예요.`;

  return {
    title: `${place.name} · 장소`,
    description,
    alternates: { canonical: `/places/${place.id}` },
    openGraph: {
      type: 'website',
      title: `${place.name} · 장소`,
      description,
      url: `${SITE_URL}/places/${place.id}`,
      images: coverImage ? [{ url: coverImage }] : undefined,
    },
  };
}

export default async function PlaceDetailPage({ params }: PageParams) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const place = await getPublicPlace(supabase, id);
  if (!place) notFound();

  const logs = await getPublicPlaceLogs(supabase, id);

  const markers: MapMarker[] = [{ lat: place.lat, lng: place.lng, name: place.name }];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: place.name,
    address: place.address ?? undefined,
    geo: { '@type': 'GeoCoordinates', latitude: place.lat, longitude: place.lng },
    ...(place.publicLogCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: place.avgRating,
            reviewCount: place.publicLogCount,
          },
        }
      : {}),
  };

  const content = (
    <div className="flex flex-col gap-6 md:gap-8">
      <JsonLd data={jsonLd} />
      <BackLink fallbackHref="/places">‹ 장소 목록으로 돌아가기</BackLink>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-extrabold text-text-primary md:text-3xl">{place.name}</h1>
          {place.category && <Tag>{place.category}</Tag>}
        </div>
        {place.address && <p className="text-sm text-text-muted">{place.address}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {place.avgRating > 0 && <HeartRating value={Math.round(place.avgRating)} />}
        <p className="text-sm text-text-secondary">
          공개된 데이트 코스 {place.publicLogCount}건에 등장했어요.
        </p>
      </div>

      <KakaoMap markers={markers} height={280} route={false} />

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-text-primary">이 장소가 등장한 공개 코스</h2>
        {logs.length > 0 ? (
          // Cards link to the anon-safe public course detail, not the couple-scoped
          // `/logs/[id]` — same rule as `/explore`.
          <DateLogFeed logs={logs} hrefBase="/explore" />
        ) : (
          <EmptyState message="아직 공개된 코스가 없어요." />
        )}
      </div>
    </div>
  );

  // Signed-out visitors get the public shell, matching `/explore/[id]`'s pattern.
  if (!user) {
    return (
      <PublicShell>
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8 md:py-16">{content}</div>
      </PublicShell>
    );
  }

  return <AppShell>{content}</AppShell>;
}
