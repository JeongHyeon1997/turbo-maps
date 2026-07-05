import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/templates';
import { DateLogFeed } from '@/components/organisms';
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
  author_id: string;
  date_log_places: { visit_order: number; rating: number | null; places: { name: string; category: string | null } | null }[];
}

export default async function ExplorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data } = await supabase
    .from('date_logs')
    .select('id, date, title, author_id, date_log_places(visit_order, rating, places(name, category))')
    .eq('visibility', 'public')
    .order('date', { ascending: false })
    .limit(50);

  const rows = (data ?? []) as unknown as Row[];

  const authorIds = [...new Set(rows.map((r) => r.author_id))];
  const nameById = new Map<string, string>();
  if (authorIds.length) {
    const { data: profs } = await supabase.from('profiles').select('id, nickname').in('id', authorIds);
    profs?.forEach((p) => nameById.set(p.id, p.nickname));
  }

  const logs: MockDateLog[] = rows.map((r, i) => {
    const dlp = [...(r.date_log_places ?? [])].sort((a, b) => a.visit_order - b.visit_order);
    const ratings = dlp.map((p) => p.rating ?? 0).filter((x) => x > 0);
    const avg = ratings.length ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;
    return {
      id: r.id,
      date: r.date,
      title: r.title ?? '무제 데이트',
      memo: '', // private memo hidden on the public feed
      rating: avg,
      places: dlp.map((p) => ({ name: p.places?.name ?? '', category: p.places?.category ?? '' })),
      cover: COVERS[i % COVERS.length]!,
      author: nameById.get(r.author_id) ?? '익명 커플',
    };
  });

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-text-primary md:text-4xl">탐색</h1>
          <p className="text-sm text-text-secondary">다른 커플이 공개한 데이트 코스를 구경해보세요.</p>
        </div>
        {logs.length > 0 ? (
          <DateLogFeed logs={logs} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center text-sm text-text-secondary">
            아직 공개된 기록이 없어요. 기록 작성 시 &ldquo;탐색에 공개&rdquo;를 켜보세요.
          </div>
        )}
      </div>
    </AppShell>
  );
}
