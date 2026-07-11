import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { AppShell, PublicShell } from '@/components/templates';
import { BackLink, JsonLd, PageTitle } from '@/components/atoms';
import { PlaceCard } from '@/components/molecules';
import { getPublicPlacesByRegion } from '@/lib/regions';
import { SITE_URL } from '@/lib/site-url';
import { ogImage } from '@/lib/og-image';

// Public region detail — reachable signed out (`/explore` prefix is public, see
// middleware.ts). Reads only the anon-safe `explore_places` view (0009), never a
// base table (`places`, `date_logs`), so memo/private cover/real nicknames can't
// leak here regardless of session state (see docs/plan/05-public-enrichment.md C).
// Do not add a query against `places` or `date_logs` to this file.

interface PageParams {
  params: Promise<{ region: string }>;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { region: encoded } = await params;
  const region = decodeURIComponent(encoded);
  const supabase = await createClient();
  const places = await getPublicPlacesByRegion(supabase, region);
  if (places.length === 0) return {};

  const description = `${region}에서 다른 커플이 다녀간 데이트 코스·맛집 ${places.length}곳을 둘러보세요.`;
  const title = `${region} 데이트 코스·맛집`;
  // Region pages have no cover of their own (they're a place aggregate, not a
  // single course/place) — always the brand default OG image. NOTE: this
  // `images` key must stay explicit here (not omitted) — this segment's
  // `generateMetadata` already returns an `openGraph` object, which replaces
  // (not merges with) whatever the root layout resolved, so omitting `images`
  // would silently drop the inherited default OG image rather than keep it.
  const image = ogImage(undefined, title);

  return {
    title,
    description,
    alternates: { canonical: `/explore/regions/${encodeURIComponent(region)}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${SITE_URL}/explore/regions/${encodeURIComponent(region)}`,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.url],
    },
  };
}

export default async function RegionDetailPage({ params }: PageParams) {
  const { region: encoded } = await params;
  const region = decodeURIComponent(encoded);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const places = await getPublicPlacesByRegion(supabase, region);
  if (places.length === 0) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${region} 데이트 코스·맛집`,
    url: `${SITE_URL}/explore/regions/${encodeURIComponent(region)}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: places.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/places/${p.id}`,
        name: p.name,
      })),
    },
  };

  const content = (
    <div className="flex flex-col gap-6 md:gap-8">
      <JsonLd data={jsonLd} />
      <BackLink fallbackHref="/explore/regions">‹ 지역 목록으로 돌아가기</BackLink>

      <div className="flex flex-col gap-1">
        <PageTitle className="text-2xl md:text-3xl">{region} 데이트 장소</PageTitle>
        <p className="text-sm text-text-secondary">
          다른 커플이 공개한 {region} 데이트 코스에 등장한 장소 {places.length}곳이에요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {places.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>
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
