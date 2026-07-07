'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Provider } from '@supabase/supabase-js';
import { colors } from '@maps/tokens';
import { createClient } from '@/lib/supabase/client';
import { OAuthButton } from '@/components/atoms';

const AUTH_ERROR = '로그인에 실패했어요. 다시 시도해 주세요.';
const OAUTH_ERROR = '소셜 로그인 연결에 실패했어요. 잠시 후 다시 시도해 주세요.';
const ERROR_MESSAGES: Record<string, string> = { auth: AUTH_ERROR, oauth: OAUTH_ERROR };

function LoginForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Where to return after login (set by the middleware guard); default home.
  const redirectPath = searchParams.get('redirect');
  // Error surfaced by the OAuth callback redirect (?error=...).
  const callbackError = searchParams.get('error');
  const message = error ?? (callbackError ? (ERROR_MESSAGES[callbackError] ?? AUTH_ERROR) : null);

  // NOTE: Supabase's Kakao provider hard-codes scope to
  // "account_email profile_image profile_nickname" — a client `scopes` option
  // only appends, it cannot shrink it. So those three consent items MUST be
  // enabled in the Kakao Developers console (동의항목), else Kakao errors.
  const signIn = async (provider: Provider) => {
    setError(null);
    setLoading(provider);
    const next = redirectPath ? `?next=${encodeURIComponent(redirectPath)}` : '';
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback${next}` },
    });
    // A returned error means the redirect never happened — recover the UI.
    if (oauthError) {
      setError(OAUTH_ERROR);
      setLoading(null);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 px-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-extrabold text-brand">We Log</h1>
        <p className="text-sm text-text-secondary">
          둘이 함께한 순간을 기록해요.
          <br />
          소셜 계정으로 시작하기.
        </p>
      </div>

      {message && (
        <p
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-center text-sm text-danger"
        >
          {message}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <OAuthButton
          label={loading === 'kakao' ? '카카오로 이동 중…' : '카카오로 시작하기'}
          onClick={() => signIn('kakao')}
          disabled={loading !== null}
          bg="#FEE500"
          fg="#191600"
        />
        <OAuthButton
          label={loading === 'google' ? 'Google로 이동 중…' : 'Google로 시작하기'}
          onClick={() => signIn('google')}
          disabled={loading !== null}
          bg="#FFFFFF"
          fg={colors.textPrimary}
        />
      </div>

      <p className="text-center text-xs text-text-muted">
        계속 진행하면 서비스 약관에 동의하는 것으로 간주됩니다.
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
