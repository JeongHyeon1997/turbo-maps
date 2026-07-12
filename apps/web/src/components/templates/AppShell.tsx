import { accentPalette } from '@maps/tokens';
import { createClient } from '@/lib/supabase/server';
import { SiteHeader, SiteFooter, BottomNav, type AvatarDescriptor } from '@/components/organisms';

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
 * failure degrades to an empty avatar list rather than breaking the shell. */
async function resolveAvatars(): Promise<{ avatars: AvatarDescriptor[]; signedIn: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { avatars: [], signedIn: false };

  try {
    const { data: couple } = await supabase
      .from('couples')
      .select('partner_a, partner_b, status')
      .or(`partner_a.eq.${user.id},partner_b.eq.${user.id}`)
      .maybeSingle();

    const partnerId =
      couple && (couple.partner_a === user.id ? couple.partner_b : couple.partner_a);
    const ids = [user.id, ...(partnerId ? [partnerId] : [])];

    // `select('*')` (not an explicit column list): `custom_avatar_url` may not
    // exist on the live DB yet, and PostgREST 42703s on a missing named column —
    // `*` degrades that field to `undefined` instead of breaking the header for
    // everyone (docs/plan/11).
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', ids);

    const byId = new Map((profiles ?? []).map((p) => [p.id, p as ProfileRow]));
    const avatars = ids.map((id, i) => toDescriptor(byId.get(id), i));
    return { avatars, signedIn: true };
  } catch {
    return { avatars: [toDescriptor(undefined, 0)], signedIn: true };
  }
}

/**
 * Responsive app shell.
 * - mobile: single narrow column + fixed bottom tab bar
 * - desktop: full-width header nav + wide centered content area
 */
export async function AppShell({ children }: { children: React.ReactNode }) {
  const { avatars, signedIn } = await resolveAvatars();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader avatars={avatars} signedIn={signedIn} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-10 pt-6 md:px-8 md:pt-10">
        {children}
      </main>
      <SiteFooter withNavOffset />
      <BottomNav />
    </div>
  );
}
