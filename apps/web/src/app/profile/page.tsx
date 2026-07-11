import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/templates';
import { ProfileActions } from '@/components/molecules';
import { Avatar, Button } from '@/components/atoms';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  const { data: couple } = await supabase
    .from('couples')
    .select('status, invite_code')
    .or(`partner_a.eq.${user.id},partner_b.eq.${user.id}`)
    .maybeSingle();

  const { count } = await supabase
    .from('date_logs')
    .select('id', { head: true, count: 'exact' });

  const nickname = profile?.nickname ?? '익명';

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Avatar initial={nickname.slice(0, 1)} imageUrl={profile?.avatar_url} name={nickname} size={56} />
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold text-text-primary">{nickname}</h1>
            <span className="text-sm text-text-muted">기록 {count ?? 0}개</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          {couple?.status === 'connected' ? (
            <p className="text-sm font-medium text-text-primary">💞 파트너와 연결됨</p>
          ) : couple ? (
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-text-primary">파트너 연결 대기 중</p>
              <p className="text-sm text-text-secondary">
                초대코드 <span className="font-bold tracking-widest text-brand">{couple.invite_code}</span>
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-text-secondary">아직 커플 연결 전이에요.</p>
              <Button href="/couple/connect" variant="ghost" size="sm">
                연결하기
              </Button>
            </div>
          )}
        </div>

        <ProfileActions initialNickname={nickname} />
      </div>
    </AppShell>
  );
}
