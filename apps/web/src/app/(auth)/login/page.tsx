'use client';

import { useState } from 'react';
import type { Provider } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { OAuthButton } from '@/components/atoms';

export default function LoginPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);

  // NOTE: Supabase's Kakao provider hard-codes scope to
  // "account_email profile_image profile_nickname" — a client `scopes` option
  // only appends, it cannot shrink it. So those three consent items MUST be
  // enabled in the Kakao Developers console (동의항목), else Kakao errors.
  const signIn = async (provider: Provider) => {
    setLoading(provider);
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 px-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-extrabold text-brand">maps</h1>
        <p className="text-sm text-text-secondary">
          둘이 함께한 순간을 기록해요.
          <br />
          소셜 계정으로 시작하기.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <OAuthButton
          label={loading === 'kakao' ? '카카오로 이동 중…' : '카카오로 시작하기'}
          onClick={() => signIn('kakao')}
          disabled={loading !== null}
          bg="#FEE500"
          fg="#191600"
        />
        <OAuthButton
          label="Google로 시작하기"
          onClick={() => signIn('google')}
          disabled={loading !== null}
          bg="#FFFFFF"
          fg="#2B2622"
        />
      </div>

      <p className="text-center text-xs text-text-muted">
        계속 진행하면 서비스 약관에 동의하는 것으로 간주됩니다.
      </p>
    </main>
  );
}
