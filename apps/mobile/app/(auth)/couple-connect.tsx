import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { joinCoupleSchema } from '@maps/shared';
import { theme } from '@maps/tokens';
import { ScreenView, AppText, Button, TextField } from '@/components/atoms';
import { useTheme } from '@/lib/theme';
import { supabase } from '@/lib/supabase';

interface CoupleRow {
  inviteCode: string;
  status: 'pending' | 'connected';
}

type Phase = 'loading' | 'ready' | 'error';

const GENERIC_JOIN_ERROR = '유효하지 않거나 이미 사용된 코드예요.';

/**
 * `/couple-connect` (docs/plan/09-mobile.md STEP 3) — mirrors web
 * `/couple/connect`: fetch-or-create the caller's `couples` row, show its
 * invite code, and let a partner join by code via the `join_couple` RPC.
 *
 * Reached only from the boot gate (`app/index.tsx`) once a session exists
 * with no connected couple, so `supabase.auth.getUser()` here runs outside
 * any `onAuthStateChange` callback tick (safe to await) and is expected to
 * resolve to a real user — the `!user` branch below is a defensive fallback,
 * not the primary guard.
 */
export default function CoupleConnectScreen() {
  const { colors } = useTheme();
  const [phase, setPhase] = useState<Phase>('loading');
  const [couple, setCouple] = useState<CoupleRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setPhase('loading');

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;
      if (!user) {
        router.replace('/login');
        return;
      }

      const { data, error } = await supabase
        .from('couples')
        .select('invite_code, status')
        .or(`partner_a.eq.${user.id},partner_b.eq.${user.id}`)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setPhase('error');
        return;
      }

      // Already connected (e.g. the partner just joined, or the user backed
      // into this screen after connecting elsewhere) — hand back to the boot
      // gate at `/` rather than duplicate its STEP 4 "connected" destination.
      if (data?.status === 'connected') {
        router.replace('/');
        return;
      }

      setCouple(data ? { inviteCode: data.invite_code, status: data.status } : null);
      setPhase('ready');
    })();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const handleCreate = async () => {
    setCreating(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCreating(false);
      router.replace('/login');
      return;
    }

    const { data, error } = await supabase
      .from('couples')
      .insert({ created_by: user.id, partner_a: user.id })
      .select('invite_code, status')
      .single();

    setCreating(false);

    if (error || !data) {
      setPhase('error');
      return;
    }

    setCouple({ inviteCode: data.invite_code, status: data.status });
  };

  const handleJoin = async () => {
    const parsed = joinCoupleSchema.safeParse({ inviteCode: joinCode });
    if (!parsed.success) {
      setJoinError(GENERIC_JOIN_ERROR);
      return;
    }

    setJoinError(null);
    setJoining(true);
    const { error } = await supabase.rpc('join_couple', {
      p_code: parsed.data.inviteCode.toUpperCase(),
    });
    setJoining(false);

    if (error) {
      setJoinError(GENERIC_JOIN_ERROR);
      return;
    }

    // Connected — re-enter the boot gate, same hand-off pattern as `login.tsx`.
    router.replace('/');
  };

  return (
    <ScreenView>
      <View style={styles.container}>
        <View style={styles.header}>
          <AppText variant="title" style={styles.centerText}>
            커플 연결
          </AppText>
          <AppText variant="body" color="secondary" style={styles.centerText}>
            파트너와 연결하면 함께 기록을 쌓을 수 있어요.
          </AppText>
        </View>

        {phase === 'loading' && (
          <AppText variant="caption" color="secondary" style={styles.centerText}>
            불러오는 중…
          </AppText>
        )}

        {phase === 'error' && (
          <View style={styles.errorState}>
            <AppText variant="caption" color="danger" style={styles.centerText}>
              커플 정보를 불러오지 못했어요. 연결 상태를 확인해 주세요.
            </AppText>
            <Button
              size="sm"
              variant="ghost"
              fullWidth={false}
              onPress={() => setRetryCount((count) => count + 1)}
            >
              다시 시도
            </Button>
          </View>
        )}

        {phase === 'ready' && (
          <>
            {couple ? (
              <View
                style={[
                  styles.codeCard,
                  { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                ]}
              >
                <AppText variant="caption" color="secondary" style={styles.centerText}>
                  파트너에게 이 초대 코드를 알려주세요
                </AppText>
                <AppText variant="displayLarge" color="brand" style={styles.centerText} selectable>
                  {couple.inviteCode}
                </AppText>
                <AppText variant="caption" color="muted" style={styles.centerText}>
                  길게 눌러 복사할 수 있어요. 파트너가 코드를 입력하면 연결이 완료돼요.
                </AppText>
              </View>
            ) : (
              <Button size="lg" onPress={handleCreate} disabled={creating}>
                {creating ? '생성 중…' : '커플 만들고 초대코드 받기'}
              </Button>
            )}

            {/* Once the user owns a couple row, joining another would put them
                in two couples at once (no membership unique constraint) and
                permanently break the boot gate's .maybeSingle() — hide the
                join path entirely in that state. */}
            {!couple && (
            <View style={styles.joinSection}>
              <AppText variant="bodyStrong" style={styles.centerText}>
                이미 초대코드를 받았나요?
              </AppText>
              <View style={styles.joinRow}>
                <TextField
                  value={joinCode}
                  onChangeText={(value) => {
                    setJoinCode(value);
                    if (joinError) setJoinError(null);
                  }}
                  placeholder="예: A1B2C3"
                  maxLength={6}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  accessibilityLabel="초대코드"
                  style={styles.joinInput}
                />
                <Button
                  size="lg"
                  fullWidth={false}
                  onPress={handleJoin}
                  disabled={joining || joinCode.trim().length === 0}
                >
                  {joining ? '연결 중…' : '연결'}
                </Button>
              </View>
              <AppText variant="caption" color="secondary" style={styles.centerText}>
                영문·숫자 6자리 코드를 입력하세요.
              </AppText>
              {joinError && (
                <View accessibilityRole="alert" accessibilityLiveRegion="polite">
                  <AppText variant="caption" color="danger" style={styles.centerText}>
                    {joinError}
                  </AppText>
                </View>
              )}
            </View>
            )}
          </>
        )}
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.space[6],
    gap: theme.space[8],
  },
  header: {
    alignItems: 'center',
    gap: theme.space[2],
  },
  centerText: {
    textAlign: 'center',
  },
  errorState: {
    alignItems: 'center',
    gap: theme.space[3],
  },
  codeCard: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: theme.radius.xl,
    paddingVertical: theme.space[6],
    paddingHorizontal: theme.space[4],
    gap: theme.space[2],
  },
  joinSection: {
    gap: theme.space[3],
  },
  joinRow: {
    flexDirection: 'row',
    gap: theme.space[2],
  },
  joinInput: {
    flex: 1,
  },
});
