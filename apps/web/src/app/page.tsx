import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/templates';
import { DateLogFeed } from '@/components/organisms';
import { SectionHeader, ConnectBanner } from '@/components/molecules';
import { Button } from '@/components/atoms';
import type { MockDateLog } from '@/lib/mock/date-logs';

const COVERS: [string, string][] = [
  ['#F6C6A8', '#E8635C'],
  ['#BFE3C0', '#8FB08A'],
  ['#D9C6EE', '#B79BD9'],
  ['#FCE1A8', '#E7A54B'],
  ['#BFE0F5', '#7FB4E0'],
];

interface Row {
  id: string;
  date: string;
  title: string | null;
  memo: string | null;
  date_log_places: { visit_order: number; rating: number | null; places: { name: string; category: string | null } | null }[];
}

function toCard(row: Row, i: number): MockDateLog {
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
    cover: COVERS[i % COVERS.length]!,
  };
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: couple } = await supabase
    .from('couples')
    .select('status')
    .or(`partner_a.eq.${user.id},partner_b.eq.${user.id}`)
    .maybeSingle();
  const connected = couple?.status === 'connected';

  const { data: rows } = await supabase
    .from('date_logs')
    .select('id, date, title, memo, date_log_places(visit_order, rating, places(name, category))')
    .order('date', { ascending: false });

  const logs = ((rows ?? []) as unknown as Row[]).map(toCard);

  return (
    <AppShell>
      <div className="flex flex-col gap-6 md:gap-8">
        {!connected && <ConnectBanner />}

        <div className="flex flex-col gap-1">
          <p className="text-sm text-text-muted">우리가 함께한 날</p>
          <p className="text-2xl font-extrabold text-text-primary md:text-4xl">
            {logs.length}개의 기록
          </p>
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
