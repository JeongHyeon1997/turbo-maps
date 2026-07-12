import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getUser } from '@/lib/supabase/server';
import { AppShell, PublicShell } from '@/components/templates';
import { KakaoMap, type MapMarker } from '@/components/organisms';
import { BackLink, HeartRating, JsonLd } from '@/components/atoms';
import { CoverHero, VisitedPlaceItem } from '@/components/molecules';
import { getPublicExploreLog } from '@/lib/explore';
import { formatLogDate } from '@/lib/format-date';
import { SITE_URL } from '@/lib/site-url';
import { ogImage } from '@/lib/og-image';

// Public detail page — reachable signed out (`/explore` prefix is public, see
// middleware.ts). Reads only the anon-safe `explore_logs` / `explore_log_places`
// views (0006/0007), never the base `date_logs` table, so memo/private cover/route
// polyline/real nicknames can't leak here regardless of session state (see
// docs/plan/05-public-enrichment.md A). Do not add a query against `date_logs`,
// `date_log_photos` or `routes` to this file.

interface PageParams {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { id } = await params;
  // `React.cache`-wrapped (see lib/explore.ts) — deduped against the same call
  // the page component below makes (docs/plan/12-performance.md STEP C, item 10).
  const log = await getPublicExploreLog(id);
  if (!log) return {};

  const placeNames = log.places.map((p) => p.name).filter(Boolean);
  const description =
    placeNames.length > 0
      ? `${placeNames.join(', ')} — 익명 커플이 공개한 데이트 코스, ${formatLogDate(log.date)}`
      : `익명 커플이 공개한 데이트 코스, ${formatLogDate(log.date)}`;

  // Always resolves to *some* absolute image URL — the course cover when one was
  // copied on publish (0006/0007), otherwise the brand default OG image. Kakao's
  // link-share scraper only renders a thumbnail when `og:image` is present and
  // absolute, so this must never be left unset.
  const image = ogImage(log.coverImage, log.title);

  return {
    title: log.title,
    description,
    alternates: { canonical: `/explore/${log.id}` },
    openGraph: {
      type: 'article',
      title: log.title,
      description,
      url: `${SITE_URL}/explore/${log.id}`,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: log.title,
      description,
      images: [image.url],
    },
  };
}

export default async function ExploreLogDetailPage({ params }: PageParams) {
  const { id } = await params;
  // Independent reads — parallelized (docs/plan/12-performance.md STEP C, item 6).
  const [user, log] = await Promise.all([getUser(), getPublicExploreLog(id)]);
  if (!log) notFound();

  const ratings = log.places.map((p) => p.rating ?? 0).filter((r) => r > 0);
  const avgRating = ratings.length
    ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length)
    : 0;

  const markers: MapMarker[] = log.places
    .filter((p) => p.lat != null && p.lng != null)
    .map((p) => ({ lat: p.lat, lng: p.lng, name: p.name }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: log.title,
    datePublished: log.date,
    url: `${SITE_URL}/explore/${log.id}`,
    image: log.coverImage ? [log.coverImage] : undefined,
    author: { '@type': 'Organization', name: log.author },
    publisher: { '@type': 'Organization', name: '위로그' },
    mentions: log.places.map((p) => ({
      '@type': 'Place',
      name: p.name,
      address: p.address ?? undefined,
      geo: { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lng },
    })),
  };

  const content = (
    <div className="flex flex-col gap-6 md:gap-8">
      <JsonLd data={jsonLd} />
      <BackLink fallbackHref="/explore">‹ 탐색으로 돌아가기</BackLink>

      <CoverHero title={log.title} dateLabel={formatLogDate(log.date)} coverImage={log.coverImage} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        {avgRating > 0 && <HeartRating value={avgRating} />}
        <p className="text-sm text-text-secondary">by {log.author}</p>
      </div>

      {markers.length > 0 && <KakaoMap markers={markers} height={320} route={false} />}

      {log.places.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-text-primary">방문한 곳</h2>
          <ul className="flex flex-col gap-3">
            {log.places.map((p, i) => (
              <VisitedPlaceItem
                key={p.id}
                order={i + 1}
                name={p.name}
                category={p.category}
                address={p.address}
                rating={p.rating}
                placeId={p.placeId}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  // Signed-out visitors get the public shell, matching `/explore`'s pattern.
  if (!user) {
    return (
      <PublicShell>
        <div className="mx-auto w-full max-w-6xl px-5 py-10 md:px-8 md:py-16">{content}</div>
      </PublicShell>
    );
  }

  return <AppShell>{content}</AppShell>;
}
