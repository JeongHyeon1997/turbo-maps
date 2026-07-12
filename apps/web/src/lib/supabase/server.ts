import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { cache } from 'react';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export const createClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list: CookieToSet[]) => {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component where cookies can't be set — safe to ignore
          }
        },
      },
    },
  );
};

/**
 * `React.cache()`-wrapped `auth.getUser()` — dedupes the `/auth/v1/user` network
 * round trip within a single request. Before this, a signed-in request paid it
 * up to 3x (middleware + page.tsx + AppShell); now page/AppShell/generateMetadata
 * share the one in-flight/resolved promise (docs/plan/12-performance.md STEP C,
 * item 5). The middleware's own `getUser()` call is unrelated (different runtime,
 * needed there to refresh cookies) and stays as-is.
 *
 * Returns `null` for anonymous requests, same as reading `data.user` yourself.
 * Never wrap this in `unstable_cache` — the result is per-user/session and must
 * never cross requests.
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export interface CoupleStatusRow {
  partner_a: string;
  partner_b: string | null;
  status: string;
}

/**
 * `React.cache()`-wrapped couple lookup, keyed by `userId` — shared by the home
 * page (needs `status` for the connect banner) and `AppShell` (needs
 * `partner_a`/`partner_b` to resolve the partner avatar) so a signed-in request
 * only hits `couples` once instead of twice (docs/plan/12-performance.md STEP C,
 * item 6). Per-user, so never wrap this in `unstable_cache` either.
 */
export const getCouple = cache(async (userId: string): Promise<CoupleStatusRow | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('couples')
    .select('partner_a, partner_b, status')
    .or(`partner_a.eq.${userId},partner_b.eq.${userId}`)
    .maybeSingle();
  return data;
});
