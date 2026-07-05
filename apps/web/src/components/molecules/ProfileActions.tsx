'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/** Editable nickname + sign-out for the profile page. */
export function ProfileActions({ initialNickname }: { initialNickname: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [nickname, setNickname] = useState(initialNickname);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!nickname.trim()) return;
    setSaving(true);
    setSaved(false);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) await supabase.from('profiles').update({ nickname: nickname.trim() }).eq('id', user.id);
    setSaving(false);
    setSaved(true);
    router.refresh();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text-secondary">닉네임</span>
        <div className="flex gap-2">
          <input
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setSaved(false);
            }}
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
          <button
            onClick={save}
            disabled={saving}
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? '저장 중' : saved ? '저장됨' : '저장'}
          </button>
        </div>
      </label>

      <button
        onClick={signOut}
        className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-alt"
      >
        로그아웃
      </button>
    </div>
  );
}
