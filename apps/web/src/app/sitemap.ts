import type { MetadataRoute } from 'next';
import { getPublicExploreLogIds } from '@/lib/explore';
import { getPublicPlaceIds } from '@/lib/places';
import { getPublicRegionNames } from '@/lib/regions';
import { guides } from '@/content/guides';
import { SITE_URL } from '@/lib/site-url';

// Crawlers can hit this route far more often than a human visitor would —
// re-generating it (and re-running the three view queries below) on every
// single request is wasted work once the underlying data itself is already
// cached for 120s (see lib/{explore,places,regions}.ts). 1h is a safe upper
// bound for a route that's not time-critical (docs/plan/12-performance.md
// STEP C, item 12).
export const revalidate = 3600;

const STATIC_PATHS = [
  '/',
  '/explore',
  '/explore/regions',
  '/places',
  '/privacy',
  '/terms',
  '/faq',
  '/guide',
];

// Repo-local editorial articles (`src/content/guides.ts`, docs/plan/10-content.md
// A1) — always included regardless of the Supabase try/catch below, since these
// URLs need no DB read at all (every `/guide/[slug]` is statically generated).
const GUIDE_ARTICLE_PATHS = guides.map((article) => `/guide/${article.slug}`);

/**
 * Public URLs only — static marketing/explore/places/guide pages plus every
 * publicly visible date-log detail (`/explore/[id]`), place (`/places/[id]`),
 * region (`/explore/regions/[region]`) and editorial article (`/guide/[slug]`).
 * Reads the anon-safe `explore_logs`/`explore_places`/`explore_regions` views
 * (never `date_logs`/`places`) and degrades to the static set alone if any
 * query fails or those views aren't live yet.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [...STATIC_PATHS, ...GUIDE_ARTICLE_PATHS].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
    }),
  );

  try {
    const [logIds, placeIds, regionNames] = await Promise.all([
      getPublicExploreLogIds(),
      getPublicPlaceIds(),
      getPublicRegionNames(),
    ]);
    const logEntries: MetadataRoute.Sitemap = logIds.map((id) => ({
      url: `${SITE_URL}/explore/${id}`,
      lastModified: new Date(),
    }));
    const placeEntries: MetadataRoute.Sitemap = placeIds.map((id) => ({
      url: `${SITE_URL}/places/${id}`,
      lastModified: new Date(),
    }));
    const regionEntries: MetadataRoute.Sitemap = regionNames.map((region) => ({
      url: `${SITE_URL}/explore/regions/${encodeURIComponent(region)}`,
      lastModified: new Date(),
    }));
    return [...staticEntries, ...logEntries, ...placeEntries, ...regionEntries];
  } catch {
    return staticEntries;
  }
}
