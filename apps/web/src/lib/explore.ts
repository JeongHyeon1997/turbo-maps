import { coverGradients } from '@maps/tokens';
import type { createClient } from '@/lib/supabase/server';
import type { MockDateLog } from '@/lib/mock/date-logs';
import { publicCoverUrl } from '@/lib/storage/public-cover-url';

// Shared by `/explore`, `/explore/[id]` and the logged-out landing preview — all
// read the anon-safe `explore_logs` / `explore_log_places` views from 0006/0007
// (docs/plan/04-public-surface.md 2단계, docs/plan/05-public-enrichment.md A).
// PostgREST can't embed across these views, so places are fetched separately and
// grouped by `date_log_id` here. Never read the base `date_logs` table from here —
// that's the whole point of going through these views (memo/private-cover safety).

// Public surfaces are anonymized by product decision — the views don't even carry
// an author nickname column. Every public log/course is attributed to this label.
const ANONYMOUS_AUTHOR = '익명 커플';

interface ExploreLogRow {
  id: string;
  couple_id: string;
  date: string;
  title: string | null;
  public_cover_path: string | null;
  created_at: string;
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

export interface PublicExplorePlace {
  id: string;
  placeId: string;
  visitOrder: number;
  rating: number | null;
  name: string;
  category: string | null;
  address: string | null;
  lat: number;
  lng: number;
}

export interface PublicExploreLogDetail {
  id: string;
  date: string;
  title: string;
  /** always '익명 커플' — public surfaces never expose real nicknames. */
  author: string;
  coverImage: string | null;
  cover: (typeof coverGradients)[number];
  places: PublicExplorePlace[];
}

/** Deterministic gradient pick for a single record (no list index to hash off of). */
function gradientForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) % coverGradients.length;
  return coverGradients[Math.abs(hash) % coverGradients.length]!;
}

function toPublicPlace(row: ExploreLogPlaceRow): PublicExplorePlace {
  return {
    id: row.id,
    placeId: row.place_id,
    visitOrder: row.visit_order,
    rating: row.rating,
    name: row.name,
    category: row.category,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
  };
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
      .select('id, couple_id, date, title, public_cover_path, created_at')
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
        author: ANONYMOUS_AUTHOR,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Best-effort single-log fetch for the public detail page `/explore/[id]`. Reads
 * only the anon-safe views — same privacy guarantee as `getPublicExploreLogs`.
 * Returns `null` when the id doesn't exist, isn't public, or the views aren't
 * live yet (caller renders `notFound()`).
 */
export async function getPublicExploreLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string,
): Promise<PublicExploreLogDetail | null> {
  try {
    const { data: logRow, error } = await supabase
      .from('explore_logs')
      .select('id, couple_id, date, title, public_cover_path, created_at')
      .eq('id', id)
      .maybeSingle();
    if (error || !logRow) return null;

    const log = logRow as unknown as ExploreLogRow;

    const { data: placeRows } = await supabase
      .from('explore_log_places')
      .select('id, date_log_id, place_id, visit_order, rating, name, category, address, lat, lng')
      .eq('date_log_id', log.id)
      .order('visit_order', { ascending: true });

    const places = ((placeRows as unknown as ExploreLogPlaceRow[] | null) ?? [])
      .slice()
      .sort((a, b) => a.visit_order - b.visit_order)
      .map(toPublicPlace);

    return {
      id: log.id,
      date: log.date,
      title: log.title ?? '무제 데이트',
      author: ANONYMOUS_AUTHOR,
      coverImage: publicCoverUrl(log.public_cover_path),
      cover: gradientForId(log.id),
      places,
    };
  } catch {
    return null;
  }
}

/** All public log ids — used by `app/sitemap.ts`. Degrades to `[]` like the fetchers above. */
export async function getPublicExploreLogIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string[]> {
  try {
    const { data, error } = await supabase.from('explore_logs').select('id');
    if (error || !data) return [];
    return (data as { id: string }[]).map((r) => r.id);
  } catch {
    return [];
  }
}
