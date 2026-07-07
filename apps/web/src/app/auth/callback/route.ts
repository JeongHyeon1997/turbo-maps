import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * OAuth / email-link callback. Exchanges the code for a session, ensures a
 * profile row exists, then redirects. Register this URL in Supabase Auth and
 * each provider (Kakao/Google) as the redirect target.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // Provider bounced back with an error (e.g. user denied consent) — no code.
  if (searchParams.get('error')) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const meta = user.user_metadata ?? {};
        const nickname =
          (meta.nickname as string) ??
          (meta.name as string) ??
          (meta.full_name as string) ??
          '익명';
        // Create the profile once; don't overwrite an edited nickname on re-login.
        await supabase
          .from('profiles')
          .upsert({ id: user.id, nickname }, { onConflict: 'id', ignoreDuplicates: true });

        // Refresh the provider avatar on every login without touching nickname
        // (a separate update so an edited nickname is never overwritten above).
        const avatarUrl = (meta.avatar_url ?? meta.picture ?? meta.profile_image_url) as
          string | undefined;
        if (avatarUrl) {
          try {
            await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
          } catch {
            // best-effort — a failed avatar sync shouldn't block login
          }
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
