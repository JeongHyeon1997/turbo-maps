import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const schema = process.env.EXPO_PUBLIC_SUPABASE_DB_SCHEMA ?? 'public';

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // PKCE, not the default 'implicit' flow — required so `signInWithOAuth`
    // returns a `?code=` param (exchanged via `exchangeCodeForSession` in
    // `src/lib/auth.ts`) instead of `#access_token` in the redirect fragment.
    // Mirrors `apps/web/src/lib/supabase/client.ts`, which gets this for free
    // from `@supabase/ssr`'s `createBrowserClient` default.
    flowType: 'pkce',
  },
  db: { schema },
});
