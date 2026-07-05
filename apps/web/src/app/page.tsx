import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/templates';
import { DateLogFeed } from '@/components/organisms';
import { SectionHeader } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { mockDateLogs } from '@/lib/mock/date-logs';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Auth gate: logged-out → login, logged-in but not connected → couple connect.
  if (!user) redirect('/login');
  const { data: couple } = await supabase
    .from('couples')
    .select('status')
    .or(`partner_a.eq.${user.id},partner_b.eq.${user.id}`)
    .maybeSingle();
  if (!couple || couple.status !== 'connected') redirect('/couple/connect');

  return (
    <AppShell>
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-text-muted">우리가 함께한 날</p>
          <p className="text-2xl font-extrabold text-text-primary md:text-4xl">
            {mockDateLogs.length}개의 기록
          </p>
        </div>

        <SectionHeader
          title="최근 데이트"
          action={
            <Button href="#" variant="primary">
              + 기록 추가
            </Button>
          }
        />

        <DateLogFeed logs={mockDateLogs} />

        <p className="py-4 text-center text-xs text-text-muted">
          목업 데이터입니다 · 지도·기록 작성은 다음 단계
        </p>
      </div>
    </AppShell>
  );
}
