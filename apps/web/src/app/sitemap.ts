import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getPublicExploreLogIds } from '@/lib/explore';
import { SITE_URL } from '@/lib/site-url';

const STATIC_PATHS = ['/', '/explore', '/privacy', '/terms'];

/**
 * Public URLs only — static marketing/explore pages plus every publicly
 * visible date-log detail (`/explore/[id]`). Reads the anon-safe `explore_logs`
 * view (never `date_logs`) and degrades to the static set alone if that view
 * isn't live yet or the query fails.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  try {
    const supabase = await createClient();
    const ids = await getPublicExploreLogIds(supabase);
    const logEntries: MetadataRoute.Sitemap = ids.map((id) => ({
      url: `${SITE_URL}/explore/${id}`,
      lastModified: new Date(),
    }));
    return [...staticEntries, ...logEntries];
  } catch {
    return staticEntries;
  }
}
