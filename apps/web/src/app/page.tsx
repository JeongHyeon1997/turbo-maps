import { coverGradients } from '@maps/tokens';
import { createClient } from '@/lib/supabase/server';
import { AppShell, PublicShell } from '@/components/templates';
import { DateLogFeed, LandingHero, LandingFeatures, ExplorePreview } from '@/components/organisms';
import { SectionHeader, ConnectBanner, EmptyState } from '@/components/molecules';
import { Button, JsonLd } from '@/components/atoms';
import type { MockDateLog } from '@/lib/mock/date-logs';
import { getPublicExploreLogs } from '@/lib/explore';
import { SITE_URL } from '@/lib/site-url';

const LANDING_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'We Log',
  url: SITE_URL,
  publisher: { '@type': 'Organization', name: 'We Log' },
};

interface Row {
  id: string;
  date: string;
  title: string | null;
  memo: string | null;
  cover_photo_path: string | null;
  date_log_places: { visit_order: number; rating: number | null; places: { name: string; category: string | null } | null }[];
}

function toCard(row: Row, i: number, coverUrl?: string | null): MockDateLog {
  const dlp = [...(row.date_log_places ?? [])].sort((a, b) => a.visit_order - b.visit_order);
  const ratings = dlp.map((p) => p.rating ?? 0).filter((r) => r > 0);
  const avg = ratings.length ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;
  return {
    id: row.id,
    date: row.date,
    title: row.title ?? '무제 데이트',
    memo: row.memo ?? '',
    rating: avg,
    places: dlp.map((p) => ({ name: p.places?.name ?? '', category: p.places?.category ?? '' })),
    cover: coverGradients[i % coverGradients.length]!,
    coverImage: coverUrl ?? null,
  };
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Best-effort excerpt of publicly visible date logs (anon-safe `explore_logs`
    // view, 0006 migration) — gracefully empty until that migration is live.
    const previewLogs = await getPublicExploreLogs(supabase, 3);
    return (
      <PublicShell>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-10 md:gap-24 md:px-8 md:py-16">
          <JsonLd data={LANDING_JSON_LD} />
          <LandingHero />
          <LandingFeatures />
          <ExplorePreview>
            {previewLogs.length > 0 ? (
              <DateLogFeed logs={previewLogs} hrefBase="/explore" />
            ) : (
              <EmptyState icon="🌤️" message="공개된 데이트 코스가 곧 채워질 예정이에요." />
            )}
          </ExplorePreview>
        </div>
      </PublicShell>
    );
  }

  const { data: couple } = await supabase
    .from('couples')
    .select('status')
    .or(`partner_a.eq.${user.id},partner_b.eq.${user.id}`)
    .maybeSingle();
  const connected = couple?.status === 'connected';

  const { data: rows } = await supabase
    .from('date_logs')
    .select(
      'id, date, title, memo, cover_photo_path, date_log_places(visit_order, rating, places(name, category))',
    )
    .order('date', { ascending: false });

  const typed = (rows ?? []) as unknown as Row[];

  // Sign cover-photo paths (private bucket) so the browser can render them.
  const paths = typed.map((r) => r.cover_photo_path).filter((p): p is string => !!p);
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data: urls } = await supabase.storage.from('date-photos').createSignedUrls(paths, 3600);
    urls?.forEach((u) => {
      if (u.path && u.signedUrl) signed.set(u.path, u.signedUrl);
    });
  }

  const logs = typed.map((r, i) =>
    toCard(r, i, r.cover_photo_path ? signed.get(r.cover_photo_path) : null),
  );

  return (
    <AppShell>
      <div className="flex flex-col gap-6 md:gap-8">
        {!connected && <ConnectBanner />}

        <div className="flex flex-col gap-1">
          <p className="text-sm text-text-muted">우리가 함께한 날</p>
          <h1 className="text-2xl font-extrabold text-text-primary md:text-4xl">
            {logs.length}개의 기록
          </h1>
        </div>

        <SectionHeader
          title="최근 데이트"
          action={
            <Button href="/logs/new" variant="primary">
              + 기록 추가
            </Button>
          }
        />

        {logs.length > 0 ? (
          <DateLogFeed logs={logs} />
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
            <p className="text-sm text-text-secondary">아직 기록이 없어요.</p>
            <Button href="/logs/new">첫 데이트 기록하기</Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
