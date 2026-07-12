import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { theme } from '@maps/tokens';
import { ScreenView, AppText, Button } from '@/components/atoms';
import { supabase } from '@/lib/supabase';

// Placeholder copy for the one branch that doesn't have a real destination
// route yet — STEP 4 ((tabs)/home) will replace this with a
// `router.replace(...)` once that route exists. Navigating to a route that
// doesn't exist would break the `expo-router` typed-routes build, so this
// screen stays mounted and swaps its own copy instead for that branch only.
// The no-couple branch (STEP 3) now has a real destination and redirects.
type BootState = 'checking' | 'connected' | 'error';

/**
 * Boot gate (docs/plan/09-mobile.md STEP 2/3): reads the persisted Supabase
 * session first. No session → redirect to `/login`. A session with no
 * connected couple → redirect to `/couple-connect` (STEP 3). A session with
 * a connected couple has no real destination yet (STEP 4's tabs/home), so
 * that branch still only renders in place (see `BootState` comment).
 *
 * Session tracking relies solely on `onAuthStateChange` — it fires an
 * `INITIAL_SESSION` event with the persisted session as soon as the client
 * has rehydrated it, so there's no separate `getSession()` call (that would
 * both duplicate the query and, more importantly, run inside the
 * `onAuthStateChange` callback tick, which Supabase's docs flag as a
 * deadlock risk for any `await`-ing Supabase call). Only the user *id* is
 * kept — `TOKEN_REFRESHED` delivers a new Session reference for the same
 * user, and keying the couples lookup off the id keeps those refreshes from
 * re-running the query and flashing the checking copy. The lookup lives in
 * its own effect, so it always runs on a later tick, outside the callback.
 */
export default function Home() {
  const [state, setState] = useState<BootState>('checking');
  // `undefined` = not yet resolved by `onAuthStateChange`, `null` = resolved, no session.
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (cancelled) return;
      // Only ever set local state here — no Supabase calls in this callback.
      setUserId(nextSession?.user.id ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (userId === undefined) return; // `onAuthStateChange` hasn't resolved yet.

    if (userId === null) {
      router.replace('/login');
      return;
    }

    let cancelled = false;
    setState('checking');

    // TODO(STEP 4): connected couple → router.replace('/(tabs)/home').
    (async () => {
      const { data: couple, error } = await supabase
        .from('couples')
        .select('status')
        .or(`partner_a.eq.${userId},partner_b.eq.${userId}`)
        .maybeSingle();

      if (cancelled) return;

      // A failed query (offline, timeout, …) is not the same as "no couple
      // row" — don't let a network hiccup route an actually-connected couple
      // into the no-couple branch. Surface it as its own state instead.
      if (error) {
        setState('error');
        return;
      }

      if (couple?.status === 'connected') {
        setState('connected');
        return;
      }

      // No connected couple yet — STEP 3's real destination now exists.
      router.replace('/couple-connect');
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, retryCount]);

  return (
    <ScreenView>
      <View style={styles.center}>
        <AppText variant="displayLarge" color="brand">
          위로그
        </AppText>
        <AppText variant="caption" color="secondary">
          {state === 'checking' && '커플의 데이트 · 맛집 · 경로 기록'}
          {state === 'connected' && '홈 피드가 곧 여기로 연결돼요 (STEP 4).'}
          {state === 'error' && '커플 정보를 불러오지 못했어요. 연결 상태를 확인해 주세요.'}
        </AppText>
        {state === 'error' && (
          <Button size="sm" variant="ghost" onPress={() => setRetryCount((count) => count + 1)}>
            다시 시도
          </Button>
        )}
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[2],
  },
});
