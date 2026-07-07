import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getPublicExploreLogIds } from '@/lib/explore';
import { getPublicPlaceIds } from '@/lib/places';
import { SITE_URL } from '@/lib/site-url';

const STATIC_PATHS = ['/', '/explore', '/places', '/privacy', '/terms'];

/**
 * Public URLs only — static marketing/explore/places pages plus every publicly
 * visible date-log detail (`/explore/[id]`) and place (`/places/[id]`). Reads
 * the anon-safe `explore_logs`/`explore_places` views (never `date_logs`/`places`)
 * and degrades to the static set alone if either query fails or those views
 * aren't live yet.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  try {
    const supabase = await createClient();
    const [logIds, placeIds] = await Promise.all([
      getPublicExploreLogIds(supabase),
      getPublicPlaceIds(supabase),
    ]);
    const logEntries: MetadataRoute.Sitemap = logIds.map((id) => ({
      url: `${SITE_URL}/explore/${id}`,
      lastModified: new Date(),
    }));
    const placeEntries: MetadataRoute.Sitemap = placeIds.map((id) => ({
      url: `${SITE_URL}/places/${id}`,
      lastModified: new Date(),
    }));
    return [...staticEntries, ...logEntries, ...placeEntries];
  } catch {
    return staticEntries;
  }
}
