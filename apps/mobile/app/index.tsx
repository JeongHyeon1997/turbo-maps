import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { theme } from '@maps/tokens';
import { ScreenView, AppText } from '@/components/atoms';
import { supabase } from '@/lib/supabase';

// Placeholder copy for the two branches that don't have a real destination
// route yet — STEP 3 (couple-connect) / STEP 4 ((tabs)/home) will replace
// these with `router.replace(...)` once those routes exist. Navigating to a
// route that doesn't exist would break the `expo-router` typed-routes build,
// so this screen stays mounted and swaps its own copy instead.
type BootState = 'checking' | 'no-couple' | 'connected';

/**
 * Boot gate (docs/plan/09-mobile.md STEP 2): reads the persisted Supabase
 * session first. No session → redirect to the one real destination that
 * exists so far, `/login`. A session gates further on couple status, but
 * only renders in place for now (see `BootState` comment).
 */
export default function Home() {
  const [state, setState] = useState<BootState>('checking');

  useEffect(() => {
    let cancelled = false;

    async function evaluate() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/login');
        return;
      }

      // TODO(STEP 3): no connected couple → router.replace('/couple-connect').
      // TODO(STEP 4): connected couple → router.replace('/(tabs)/home').
      const { data: couple } = await supabase
        .from('couples')
        .select('status')
        .or(`partner_a.eq.${session.user.id},partner_b.eq.${session.user.id}`)
        .maybeSingle();

      if (cancelled) return;
      setState(couple?.status === 'connected' ? 'connected' : 'no-couple');
    }

    void evaluate();

    // Re-evaluate on auth changes — e.g. the login screen just exchanged a
    // code and this screen is still mounted underneath it (`router.replace`
    // keeps the previous screen alive for the transition), or the session
    // was cleared by a sign-out elsewhere.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (!session) {
        router.replace('/login');
      } else {
        void evaluate();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <ScreenView>
      <View style={styles.center}>
        <AppText variant="displayLarge" color="brand">
          위로그
        </AppText>
        <AppText variant="caption" color="secondary">
          {state === 'checking' && '커플의 데이트 · 맛집 · 경로 기록'}
          {state === 'no-couple' && '커플 연결 화면이 곧 여기로 연결돼요 (STEP 3).'}
          {state === 'connected' && '홈 피드가 곧 여기로 연결돼요 (STEP 4).'}
        </AppText>
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
