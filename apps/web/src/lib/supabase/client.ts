'use client';

import { createBrowserClient } from '@supabase/ssr';

const schema = process.env.NEXT_PUBLIC_SUPABASE_DB_SCHEMA ?? 'public';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema } },
  );
