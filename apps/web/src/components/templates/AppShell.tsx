import { Suspense } from 'react';
import { accentPalette } from '@maps/tokens';
import { createClient, getUser, getCouple } from '@/lib/supabase/server';
import { SiteHeader, SiteFooter, BottomNav, type AvatarDescriptor } from '@/components/organisms';
import { AuthAction } from '@/components/molecules';
import { Skeleton } from '@/components/atoms';

interface ProfileRow {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
  // Optional: `custom_avatar_url` (migration 0010) may not exist on the live DB
  // yet — the `select('*')` below degrades this to `undefined` rather than a
  // 42703 error, and the coalesce below just falls through to `avatar_url`.
  custom_avatar_url?: string | null;
}

const PARTNER_COLORS = [accentPalette.coral, accentPalette.lavender] as const;

function toDescriptor(profile: ProfileRow | undefined, order: number): AvatarDescriptor {
  const nickname = profile?.nickname ?? null;
  return {
    initial: nickname ? nickname.slice(0, 1) : '?',
    color: PARTNER_COLORS[order % PARTNER_COLORS.length],
    imageUrl: profile?.custom_avatar_url ?? profile?.avatar_url ?? null,
    name: nickname ?? undefined,
  };
}

/** Signed-in header avatars: self first, then partner (if connected). Best-effort — any read
 * failure degrades to a single placeholder avatar rather than breaking the shell. */
async function resolveAvatars(userId: string): Promise<AvatarDescriptor[]> {
  try {
    const supabase = await createClient();
    const couple = await getCouple(userId);

    const partnerId =
      couple && (couple.partner_a === userId ? couple.partner_b : couple.partner_a);
    const ids = [userId, ...(partnerId ? [partnerId] : [])];

    // `select('*')` (not an explicit column list): `custom_avatar_url` may not
    // exist on the live DB yet, and PostgREST 42703s on a missing named column —
    // `*` degrades that field to `undefined` instead of breaking the header for
    // everyone (docs/plan/11).
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', ids);

    const byId = new Map((profiles ?? []).map((p) => [p.id, p as ProfileRow]));
    return ids.map((id, i) => toDescriptor(byId.get(id), i));
  } catch {
    return [toDescriptor(undefined, 0)];
  }
}

/**
 * Resolves the header avatar cluster (couples+profiles query) as its own async component,
 * rendered inside a `Suspense` boundary by `AppShell` so that query no longer blocks the
 * header/body shell from flushing (docs/plan/12-performance.md STEP E, item 9). `signedIn` is
 * always `true` here — this only renders once `AppShell` has already confirmed a session.
 */
async function HeaderAvatars({ userId }: { userId: string }) {
  const avatars = await resolveAvatars(userId);
  return <AuthAction signedIn avatars={avatars} />;
}

/**
 * Fixed-size placeholder shown while `HeaderAvatars` resolves. Matches `AuthAction`'s
 * `min-h-11 min-w-11` tap-target footprint so the real avatar(s) popping in doesn't shift the
 * header's height (a width change from 1→2 avatars is still possible but doesn't cause CLS).
 */
function HeaderAvatarsFallback() {
  return (
    <span className="flex min-h-11 min-w-11 items-center justify-center">
      <Skeleton className="h-8 w-8 rounded-full" />
    </span>
  );
}

/**
 * Responsive app shell.
 * - mobile: single narrow column + fixed bottom tab bar
 * - desktop: full-width header nav + wide centered content area
 */
export async function AppShell({ children }: { children: React.ReactNode }) {
  // Cheap and `React.cache`-deduped against any other `getUser()` call in this
  // request (e.g. the page component) — determining `signedIn`/nav items no
  // longer waits on the couples+profiles avatar query below.
  const user = await getUser();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader
        signedIn={!!user}
        authSlot={
          user ? (
            <Suspense fallback={<HeaderAvatarsFallback />}>
              <HeaderAvatars userId={user.id} />
            </Suspense>
          ) : undefined
        }
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-10 pt-6 md:px-8 md:pt-10">
        {children}
      </main>
      <SiteFooter withNavOffset />
      <BottomNav />
    </div>
  );
}
