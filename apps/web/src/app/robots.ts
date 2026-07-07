import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-url';

// Keep in sync with `PUBLIC_PREFIXES`/`EXACT_PUBLIC` in `src/lib/supabase/middleware.ts` —
// anything not explicitly public there is a protected route and must be disallowed here too.
const DISALLOW = [
  '/logs',
  '/logs/new',
  '/map',
  '/calendar',
  '/profile',
  '/couple',
  '/login',
  '/auth',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/explore', '/places', '/privacy', '/terms'],
      disallow: DISALLOW,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
