import { createClient } from '@supabase/supabase-js';

// Module-level singleton, cookie-independent client — for **public view fetchers
// only** (`explore_logs`/`explore_log_places`/`explore_places`/`explore_place_logs`/
// `explore_regions`, see lib/{explore,places,regions}.ts). Those views apply their
// own `visibility = 'public'` filter regardless of caller identity, so anon and
// authenticated requests return byte-identical rows (docs/plan/12-performance.md
// STEP C, item 2) — that's what makes a shared, request-independent client safe
// here. Never point this at a base table (`date_logs`, `places`, `profiles`, ...):
// those are RLS-gated per user/couple and need the cookie-bound client from
// `./server.ts` instead.
const schema = process.env.NEXT_PUBLIC_SUPABASE_DB_SCHEMA ?? 'public';

export const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: { schema },
    auth: { persistSession: false, autoRefreshToken: false },
  },
);
