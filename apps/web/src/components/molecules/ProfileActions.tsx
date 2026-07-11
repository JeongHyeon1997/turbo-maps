'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, TextField } from '@/components/atoms';

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
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-secondary">닉네임</span>
        <div className="flex gap-2">
          <TextField
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setSaved(false);
            }}
            className="flex-1"
          />
          <Button onClick={save} disabled={saving} size="lg" fullWidth={false}>
            {saving ? '저장 중' : saved ? '저장됨' : '저장'}
          </Button>
        </div>
      </label>

      <button
        onClick={signOut}
        className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-all duration-200 ease-out hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        로그아웃
      </button>
    </div>
  );
}
