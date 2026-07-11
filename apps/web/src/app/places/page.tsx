import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { AppShell, PublicShell } from '@/components/templates';
import { FilterChip, PageTitle } from '@/components/atoms';
import { PlaceCard, EmptyState } from '@/components/molecules';
import { getPublicPlaces } from '@/lib/places';

// Public directory — reachable signed out (`/places` prefix is public, see
// middleware.ts). Reads only the anon-safe `explore_places` view (0008), never
// the base `places`/`date_logs` tables (see docs/plan/05-public-enrichment.md B).

export const metadata: Metadata = {
  title: '장소 디렉터리',
  description: '다른 커플이 공개한 데이트 코스에 등장한 장소를 카테고리별로 둘러보세요.',
  alternates: { canonical: '/places' },
};

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function PlacesDirectoryPage({ searchParams }: PageProps) {
  const { category } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch once, unfiltered — reused both to derive the category chip list and
  // (filtered in-memory below) as the grid itself, avoiding a second round trip.
  const places = await getPublicPlaces(supabase);
  const categories = Array.from(
    new Set(places.map((p) => p.category).filter((c): c is string => !!c)),
  ).sort((a, b) => a.localeCompare(b, 'ko'));
  const visible = category ? places.filter((p) => p.category === category) : places;

  const content = (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <PageTitle className="text-2xl md:text-4xl">장소 디렉터리</PageTitle>
        <p className="text-sm text-text-secondary">
          다른 커플이 다녀간 공개 장소를 카테고리별로 둘러보세요.
        </p>
      </div>

      {categories.length > 0 && (
        <nav className="flex flex-wrap gap-2" aria-label="카테고리 필터">
          <FilterChip href="/places" active={!category}>
            전체
          </FilterChip>
          {categories.map((c) => (
            <FilterChip key={c} href={`/places?category=${encodeURIComponent(c)}`} active={category === c}>
              {c}
            </FilterChip>
          ))}
        </nav>
      )}

      {visible.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {visible.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      ) : (
        <EmptyState message="아직 공개된 장소가 없어요. 기록 작성 시 “탐색에 공개”를 켜보세요." />
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
