import { createClient } from '@/lib/supabase/server';
import { AppShell, PublicShell } from '@/components/templates';
import { DateLogFeed } from '@/components/organisms';
import { getPublicExploreLogs } from '@/lib/explore';

// Public page — reachable signed out (see PUBLIC_PREFIXES in middleware.ts).
// Reads only from the anon-safe `explore_logs` / `explore_log_places` views
// (0006 migration), never the base `date_logs` table, so private fields
// (memo, private cover path) can't leak here regardless of session state.
export default async function ExplorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const logs = await getPublicExploreLogs(supabase, 50);

  const content = (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-text-primary md:text-4xl">탐색</h1>
        <p className="text-sm text-text-secondary">다른 커플이 공개한 데이트 코스를 구경해보세요.</p>
      </div>
      {logs.length > 0 ? (
        // Cards link to the anon-safe public detail page (`/explore/[id]`), not
        // the couple-scoped `/logs/[id]` — that keeps memo/private fields
        // structurally unreachable regardless of session state.
        <DateLogFeed logs={logs} hrefBase="/explore" />
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center text-sm text-text-secondary">
          아직 공개된 기록이 없어요. 기록 작성 시 &ldquo;탐색에 공개&rdquo;를 켜보세요.
        </div>
      )}
    </div>
  );

  // Signed-out visitors get the public shell (no BottomNav/desktop nav that
  // would funnel them into protected routes and bounce them back to /login).
  // Unlike AppShell, PublicShell's <main> carries no padding/max-width of its
  // own (see the landing page), so add the same container here.
  if (!user) {
    return (
      <PublicShell>
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8 md:py-16">{content}</div>
      </PublicShell>
    );
  }

  return <AppShell>{content}</AppShell>;
}
