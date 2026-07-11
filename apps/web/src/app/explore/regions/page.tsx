import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { AppShell, PublicShell } from '@/components/templates';
import { RegionCard, EmptyState } from '@/components/molecules';
import { getPublicRegions } from '@/lib/regions';

// Public region index — reachable signed out (`/explore` prefix is public, see
// middleware.ts). Reads only the anon-safe `explore_regions` view (0009), never
// a base table, so it degrades to an empty list before that migration is live
// (see docs/plan/05-public-enrichment.md C).

export const metadata: Metadata = {
  title: '지역별 데이트 코스',
  description: '다른 커플이 공개한 데이트 코스를 지역(구/시·군)별로 둘러보세요.',
  alternates: { canonical: '/explore/regions' },
};

export default async function RegionIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const regions = await getPublicRegions(supabase);

  const content = (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-text-primary md:text-4xl">지역별 데이트 코스</h1>
        <p className="text-sm text-text-secondary">
          다른 커플이 다녀간 공개 데이트 코스를 지역별로 둘러보세요.
        </p>
      </div>

      {regions.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {regions.map((r) => (
            <RegionCard key={r.region} region={r} />
          ))}
        </div>
      ) : (
        <EmptyState message="아직 지역별로 모인 공개 코스가 없어요." />
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
