import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type OAuthProvider = 'kakao' | 'google';

export type SignInResult =
  | { status: 'success' }
  | { status: 'cancelled' }
  | { status: 'error'; message: string };

const GENERIC_ERROR = '로그인에 실패했어요. 다시 시도해 주세요.';

/**
 * OAuth deep-link flow (docs/plan/09-mobile.md "기술 결정 사항" #1):
 *
 * 1. `signInWithOAuth({ skipBrowserRedirect: true })` — ask Supabase for the
 *    provider authorize URL without letting the SDK try (and fail) to
 *    navigate a browser itself.
 * 2. `WebBrowser.openAuthSessionAsync` — open that URL in an in-app browser
 *    tab that watches for the redirect back to our `redirectTo` deep link.
 * 3. Parse `?code=` off the returned URL and hand it to
 *    `exchangeCodeForSession` (PKCE — see `supabase.ts` `flowType: 'pkce'`).
 * 4. Mirror the web `/auth/callback` route's profile upsert so a `profiles`
 *    row exists with the same columns web writes (`nickname`/`avatar_url`).
 *
 * `redirectTo` resolves to `exp://<lan-ip>:<port>/--/auth/callback` under
 * Expo Go (the Expo proxy) and `maps://auth/callback` in a standalone/dev
 * build — both need registering in the Supabase Auth redirect allow-list and
 * in the Kakao/Google OAuth console (open question 3 in the plan doc).
 */
export async function signInWithProvider(provider: OAuthProvider): Promise<SignInResult> {
  const redirectTo = AuthSession.makeRedirectUri({ scheme: 'maps', path: 'auth/callback' });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { skipBrowserRedirect: true, redirectTo },
  });

  if (error || !data?.url) {
    return { status: 'error', message: GENERIC_ERROR };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  // User closed the in-app browser / backed out — not a failure, stay quiet.
  // (Compared against the `WebBrowserResultType` enum, not raw string
  // literals — `result.type` is `WebBrowserResultType | 'success'`.)
  if (
    result.type === WebBrowser.WebBrowserResultType.CANCEL ||
    result.type === WebBrowser.WebBrowserResultType.DISMISS
  ) {
    return { status: 'cancelled' };
  }

  if (result.type !== 'success') {
    return { status: 'error', message: GENERIC_ERROR };
  }

  const redirectUrl = new URL(result.url);

  // Provider bounced back with an error (e.g. user denied consent) — no code.
  if (redirectUrl.searchParams.get('error')) {
    return { status: 'error', message: GENERIC_ERROR };
  }

  const code = redirectUrl.searchParams.get('code');
  if (!code) {
    return { status: 'error', message: GENERIC_ERROR };
  }

  const { data: sessionData, error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError || !sessionData.session) {
    return { status: 'error', message: GENERIC_ERROR };
  }

  // Best-effort — a failed profile sync shouldn't block a successful login;
  // the boot gate / profile screen can retry the read later.
  try {
    await upsertProfileFromUser(sessionData.session.user);
  } catch {
    // swallow — see comment above
  }

  return { status: 'success' };
}

/**
 * Mirrors `apps/web/src/app/auth/callback/route.ts`: create the `profiles`
 * row once from OAuth `user_metadata` (never overwriting an edited nickname
 * on re-login), then refresh the avatar on every login in a separate update.
 */
async function upsertProfileFromUser(user: User): Promise<void> {
  const meta = user.user_metadata ?? {};
  const nickname =
    (meta.nickname as string | undefined) ??
    (meta.name as string | undefined) ??
    (meta.full_name as string | undefined) ??
    '익명';

  await supabase
    .from('profiles')
    .upsert({ id: user.id, nickname }, { onConflict: 'id', ignoreDuplicates: true });

  const avatarUrl = (meta.avatar_url ?? meta.picture ?? meta.profile_image_url) as
    | string
    | undefined;
  if (avatarUrl) {
    await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
  }
}
