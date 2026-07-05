import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/atoms';

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
        <h1 className="text-2xl font-extrabold text-text-primary">커플 연결</h1>
        <p className="text-sm text-text-secondary">파트너와 연결하면 함께 기록을 쌓을 수 있어요.</p>
      </div>

      {couple ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm text-text-secondary">파트너에게 이 초대 코드를 알려주세요</p>
          <p className="text-3xl font-extrabold tracking-widest text-brand">{couple.invite_code}</p>
          <p className="text-xs text-text-muted">파트너가 코드를 입력하면 연결이 완료돼요.</p>
        </div>
      ) : (
        <form action={createCouple}>
          <Button>커플 만들고 초대코드 받기</Button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        <p className="text-center text-sm font-medium text-text-secondary">
          이미 초대코드를 받았나요?
        </p>
        <form action={joinCouple} className="flex gap-2">
          <input
            name="code"
            placeholder="초대코드"
            className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm uppercase outline-none focus:border-brand"
          />
          <button className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white">
            연결
          </button>
        </form>
        {error === 'join' && (
          <p className="text-center text-xs text-danger">유효하지 않거나 이미 사용된 코드예요.</p>
        )}
      </div>
    </main>
  );
}
