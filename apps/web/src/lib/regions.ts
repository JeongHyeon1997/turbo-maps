import type { createClient } from '@/lib/supabase/server';
import { EXPLORE_PLACE_COLUMNS, toPublicPlace, type ExplorePlaceRow, type PublicPlace } from '@/lib/places';

// Backs `/explore/regions` and `/explore/regions/[region]` — anon-safe region aggregates
// from the 0009 migration (docs/plan/05-public-enrichment.md C). Same rule as
// `lib/places.ts`/`lib/explore.ts`: only read the `explore_regions` /
// `explore_places` views, never a base table (`places`, `date_logs`) directly.
// 0009 may not be live yet, so every export below degrades to `[]` on any error.

interface ExploreRegionRow {
  region: string;
  place_count: number;
  public_log_count: number;
}

export interface PublicRegion {
  region: string;
  placeCount: number;
  publicLogCount: number;
}

function toPublicRegion(row: ExploreRegionRow): PublicRegion {
  return {
    region: row.region,
    placeCount: row.place_count,
    publicLogCount: row.public_log_count,
  };
}

/**
 * Region index for `/explore/regions`, most active first (public log count desc).
 * `region` is never null here — the view excludes places it couldn't parse a
 * region for.
 */
export async function getPublicRegions(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<PublicRegion[]> {
  try {
    const { data, error } = await supabase
      .from('explore_regions')
      .select('region, place_count, public_log_count')
      .order('public_log_count', { ascending: false });
    if (error || !data) return [];
    return (data as unknown as ExploreRegionRow[]).map(toPublicRegion);
  } catch {
    return [];
  }
}

/**
 * Places in a single region for `/explore/regions/[region]`, most-visited first —
 * same shape/mapper as `lib/places.ts`'s `getPublicPlaces` so the page can reuse
 * `PlaceCard` unchanged.
 */
export async function getPublicPlacesByRegion(
  supabase: Awaited<ReturnType<typeof createClient>>,
  region: string,
): Promise<PublicPlace[]> {
  try {
    const { data, error } = await supabase
      .from('explore_places')
      .select(EXPLORE_PLACE_COLUMNS)
      .eq('region', region)
      .order('public_log_count', { ascending: false });
    if (error || !data) return [];
    return (data as unknown as ExplorePlaceRow[]).map(toPublicPlace);
  } catch {
    return [];
  }
}

/** All public region names — used by `app/sitemap.ts`. Degrades to `[]` like the fetchers above. */
export async function getPublicRegionNames(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string[]> {
  try {
    const { data, error } = await supabase.from('explore_regions').select('region');
    if (error || !data) return [];
    return (data as { region: string }[]).map((r) => r.region);
  } catch {
    return [];
  }
}
