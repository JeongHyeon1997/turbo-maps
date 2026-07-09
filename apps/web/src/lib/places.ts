import type { createClient } from '@/lib/supabase/server';
import type { MockDateLog } from '@/lib/mock/date-logs';
import { publicCoverUrl } from '@/lib/storage/public-cover-url';
import { ANONYMOUS_AUTHOR, gradientForId } from '@/lib/explore';

// Backs `/places` and `/places/[id]` — anon-safe place aggregates from the 0008
// migration (docs/plan/05-public-enrichment.md B). Same rule as `lib/explore.ts`:
// only read the `explore_places` / `explore_place_logs` views, never a base table
// (`places`, `date_logs`, `date_log_places`) directly — that's what keeps memo,
// private covers and real nicknames structurally unreachable here. 0008 may not be
// live yet, so every export below degrades to `null`/`[]` on any error.

// Exported so `lib/regions.ts` can query the same view/columns for
// `getPublicPlacesByRegion` without redefining the row shape or mapper.
export interface ExplorePlaceRow {
  place_id: string;
  kakao_place_id: string;
  name: string;
  category: string | null;
  address: string | null;
  lat: number;
  lng: number;
  public_log_count: number;
  avg_rating: number | null;
  region: string | null;
}

interface ExplorePlaceLogRow {
  place_id: string;
  date_log_id: string;
  title: string | null;
  date: string;
  public_cover_path: string | null;
  rating: number | null;
}

export interface PublicPlace {
  id: string;
  kakaoPlaceId: string;
  name: string;
  category: string | null;
  address: string | null;
  lat: number;
  lng: number;
  publicLogCount: number;
  avgRating: number;
  /** Region (구/시·군) derived from address, `null` when it couldn't be parsed. See lib/regions.ts. */
  region: string | null;
}

export function toPublicPlace(row: ExplorePlaceRow): PublicPlace {
  return {
    id: row.place_id,
    kakaoPlaceId: row.kakao_place_id,
    name: row.name,
    category: row.category,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    publicLogCount: row.public_log_count,
    avgRating: row.avg_rating ?? 0,
    region: row.region,
  };
}

/** Select list shared by every `explore_places` query in this file and `lib/regions.ts`. */
export const EXPLORE_PLACE_COLUMNS =
  'place_id, kakao_place_id, name, category, address, lat, lng, public_log_count, avg_rating, region';

/**
 * Best-effort single-place fetch for `/places/[id]`. Returns `null` when the
 * place doesn't exist, has no public courses, or the view isn't live yet
 * (caller renders `notFound()`).
 */
export async function getPublicPlace(
  supabase: Awaited<ReturnType<typeof createClient>>,
  placeId: string,
): Promise<PublicPlace | null> {
  try {
    const { data, error } = await supabase
      .from('explore_places')
      .select(EXPLORE_PLACE_COLUMNS)
      .eq('place_id', placeId)
      .maybeSingle();
    if (error || !data) return null;
    return toPublicPlace(data as unknown as ExplorePlaceRow);
  } catch {
    return null;
  }
}

/**
 * Public courses (date logs) a place appeared in, newest first — mapped to the
 * same `MockDateLog` shape `DateLogFeed`/`DateLogCard` already render so the
 * place page can reuse them (`hrefBase="/explore"`). `places` is left empty:
 * this view only carries the one place the page is already about, so a self-tag
 * on every card would be redundant.
 */
export async function getPublicPlaceLogs(
  supabase: Awaited<ReturnType<typeof createClient>>,
  placeId: string,
): Promise<MockDateLog[]> {
  try {
    const { data, error } = await supabase
      .from('explore_place_logs')
      .select('place_id, date_log_id, title, date, public_cover_path, rating')
      .eq('place_id', placeId)
      .order('date', { ascending: false });
    if (error || !data) return [];

    return (data as unknown as ExplorePlaceLogRow[]).map((row) => ({
      id: row.date_log_id,
      date: row.date,
      title: row.title ?? '무제 데이트',
      memo: '', // private memo — never exposed on public surfaces
      rating: row.rating ?? 0,
      places: [],
      cover: gradientForId(row.date_log_id),
      coverImage: publicCoverUrl(row.public_cover_path),
      author: ANONYMOUS_AUTHOR,
    }));
  } catch {
    return [];
  }
}

/**
 * Directory listing for `/places`, most-visited first. `category` narrows the
 * DB query when passed, but the page itself fetches unfiltered and filters
 * in-memory so it can derive the category chip list from the same round trip.
 */
export async function getPublicPlaces(
  supabase: Awaited<ReturnType<typeof createClient>>,
  options: { category?: string } = {},
): Promise<PublicPlace[]> {
  try {
    let query = supabase
      .from('explore_places')
      .select(EXPLORE_PLACE_COLUMNS)
      .order('public_log_count', { ascending: false });
    if (options.category) query = query.eq('category', options.category);

    const { data, error } = await query;
    if (error || !data) return [];
    return (data as unknown as ExplorePlaceRow[]).map(toPublicPlace);
  } catch {
    return [];
  }
}

/** All public place ids — used by `app/sitemap.ts`. Degrades to `[]` like the fetchers above. */
export async function getPublicPlaceIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string[]> {
  try {
    const { data, error } = await supabase.from('explore_places').select('place_id');
    if (error || !data) return [];
    return (data as { place_id: string }[]).map((r) => r.place_id);
  } catch {
    return [];
  }
}
