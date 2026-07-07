import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/templates';
import { DateLogFeed } from '@/components/organisms';
import { getPublicExploreLogs } from '@/lib/explore';

// Public page — reachable signed out (see PUBLIC_PREFIXES in middleware.ts).
// Reads only from the anon-safe `explore_logs` / `explore_log_places` views
// (0006 migration), never the base `date_logs` table, so private fields
// (memo, private cover path) can't leak here regardless of session state.
export default async function ExplorePage() {
  const supabase = await createClient();
  const logs = await getPublicExploreLogs(supabase, 50);

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-text-primary md:text-4xl">탐색</h1>
          <p className="text-sm text-text-secondary">다른 커플이 공개한 데이트 코스를 구경해보세요.</p>
        </div>
        {logs.length > 0 ? (
          <DateLogFeed logs={logs} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center text-sm text-text-secondary">
            아직 공개된 기록이 없어요. 기록 작성 시 &ldquo;탐색에 공개&rdquo;를 켜보세요.
          </div>
        )}
      </div>
    </AppShell>
  );
}
