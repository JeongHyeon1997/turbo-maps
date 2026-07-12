import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button, PageTitle, TextField } from '@/components/atoms';

async function createCouple() {
  'use server';
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  await supabase.from('couples').insert({ created_by: user.id, partner_a: user.id });
  redirect('/couple/connect');
}

async function joinCouple(formData: FormData) {
  'use server';
  const code = String(formData.get('code') ?? '').trim();
  const supabase = await createClient();
  const { error } = await supabase.rpc('join_couple', { p_code: code });
  redirect(error ? '/couple/connect?error=join' : '/');
}

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: couple } = await supabase
    .from('couples')
    .select('invite_code, status')
    .or(`partner_a.eq.${user.id},partner_b.eq.${user.id}`)
    .maybeSingle();

  if (couple?.status === 'connected') redirect('/');

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 px-6">
      <div className="flex flex-col gap-2 text-center">
        <PageTitle className="text-2xl">커플 연결</PageTitle>
        <p className="text-sm text-text-secondary">파트너와 연결하면 함께 기록을 쌓을 수 있어요.</p>
      </div>

      {couple ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm text-text-secondary">파트너에게 이 초대 코드를 알려주세요</p>
          <p className="text-3xl font-bold tracking-widest text-brand">{couple.invite_code}</p>
          <p className="text-xs text-text-secondary">파트너가 코드를 입력하면 연결이 완료돼요.</p>
        </div>
      ) : (
        <form action={createCouple}>
          <Button type="submit" size="lg">
            커플 만들고 초대코드 받기
          </Button>
        </form>
      )}

      {/* Once the user owns a couple row, joining another would put them in
          two couples at once (no membership unique constraint) and break
          every .maybeSingle() couple lookup — hide the join path entirely. */}
      {!couple && (
        <div className="flex flex-col gap-3">
          <p className="text-center text-sm font-medium text-text-secondary">
            이미 초대코드를 받았나요?
          </p>
          <form action={joinCouple} className="flex flex-col gap-1.5">
            <label htmlFor="invite-code" className="sr-only">
              초대코드
            </label>
            <div className="flex gap-2">
              <TextField
                id="invite-code"
                name="code"
                placeholder="예: A1B2C3"
                maxLength={6}
                aria-describedby="invite-code-hint"
                className="flex-1 uppercase"
              />
              <Button type="submit" size="lg" fullWidth={false}>
                연결
              </Button>
            </div>
            <p id="invite-code-hint" className="text-center text-xs text-text-secondary">
              영문·숫자 6자리 코드를 입력하세요.
            </p>
          </form>
          {error === 'join' && (
            <p className="text-center text-xs text-danger">유효하지 않거나 이미 사용된 코드예요.</p>
          )}
        </div>
      )}
    </main>
  );
}
