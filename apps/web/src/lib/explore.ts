import { coverGradients } from '@maps/tokens';
import type { createClient } from '@/lib/supabase/server';
import type { MockDateLog } from '@/lib/mock/date-logs';
import { publicCoverUrl } from '@/lib/storage/public-cover-url';

// Shared by `/explore` and the logged-out landing preview — both read the
// anon-safe `explore_logs` / `explore_log_places` views from 0006
// (docs/plan/04-public-surface.md 2단계). PostgREST can't embed across these
// views, so places are fetched separately and grouped by `date_log_id` here.

interface ExploreLogRow {
  id: string;
  couple_id: string;
  date: string;
  title: string | null;
  public_cover_path: string | null;
  created_at: string;
  author_nickname: string | null;
}

interface ExploreLogPlaceRow {
  id: string;
  date_log_id: string;
  place_id: string;
  visit_order: number;
  rating: number | null;
  name: string;
  category: string | null;
  address: string | null;
  lat: number;
  lng: number;
}

/**
 * Best-effort fetch of publicly visible date logs from the anon-safe `explore_logs`
 * view. The 0006 migration that creates it hasn't been applied live yet, so this
 * quietly returns `[]` on any error instead of throwing — callers fall back to an
 * EmptyState placeholder. Once 0006 is live, this starts returning real rows with
 * no code change needed.
 */
export async function getPublicExploreLogs(
  supabase: Awaited<ReturnType<typeof createClient>>,
  limit: number,
): Promise<MockDateLog[]> {
  try {
    const { data: logRows, error } = await supabase
      .from('explore_logs')
      .select('id, couple_id, date, title, public_cover_path, created_at, author_nickname')
      .order('date', { ascending: false })
      .limit(limit);
    if (error || !logRows) return [];

    const logs = logRows as unknown as ExploreLogRow[];
    const logIds = logs.map((l) => l.id);

    const placesByLog = new Map<string, ExploreLogPlaceRow[]>();
    if (logIds.length > 0) {
      const { data: placeRows } = await supabase
        .from('explore_log_places')
        .select('id, date_log_id, place_id, visit_order, rating, name, category, address, lat, lng')
        .in('date_log_id', logIds);
      (placeRows as unknown as ExploreLogPlaceRow[] | null)?.forEach((p) => {
        const list = placesByLog.get(p.date_log_id) ?? [];
        list.push(p);
        placesByLog.set(p.date_log_id, list);
      });
    }

    return logs.map((log, i) => {
      const places = (placesByLog.get(log.id) ?? []).sort((a, b) => a.visit_order - b.visit_order);
      const ratings = places.map((p) => p.rating ?? 0).filter((r) => r > 0);
      const avg = ratings.length ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;
      return {
        id: log.id,
        date: log.date,
        title: log.title ?? '무제 데이트',
        memo: '', // private memo — never exposed on the public feed
        rating: avg,
        places: places.map((p) => ({ name: p.name, category: p.category ?? '' })),
        cover: coverGradients[i % coverGradients.length]!,
        coverImage: publicCoverUrl(log.public_cover_path),
        author: log.author_nickname ?? '익명 커플',
      };
    });
  } catch {
    return [];
  }
}
