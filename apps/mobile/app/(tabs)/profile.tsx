import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { theme } from '@maps/tokens';
import { ScreenView, AppText, Button } from '@/components/atoms';
import { ThemeToggle } from '@/components/molecules';
import { useTheme } from '@/lib/theme';
import { supabase } from '@/lib/supabase';

type Phase = 'loading' | 'ready' | 'error';

interface ProfileData {
  nickname: string;
  coupleStatus: 'pending' | 'connected' | null;
  inviteCode: string | null;
}

/**
 * Profile tab (docs/plan/09-mobile.md STEP 4) — mirrors web `/profile`'s
 * read-only pieces (nickname, couple status). Avatar editing (`AvatarUploader`,
 * `docs/plan/11-profile-editing.md`) and nickname editing are explicitly out
 * of STEP 4 scope ("mobile 이식은 09 Phase 1 뷰 이후") — this screen adds only
 * what STEP 4 specifies: nickname · couple status · theme toggle · logout.
 */
export default function ProfileScreen() {
  const { colors } = useTheme();
  const [phase, setPhase] = useState<Phase>('loading');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [signingOut, setSigningOut] = useState(false);
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

      const [{ data: profileRow, error: profileError }, { data: coupleRow, error: coupleError }] =
        await Promise.all([
          supabase.from('profiles').select('nickname').eq('id', user.id).maybeSingle(),
          supabase
            .from('couples')
            .select('status, invite_code')
            .or(`partner_a.eq.${user.id},partner_b.eq.${user.id}`)
            .maybeSingle(),
        ]);

      if (cancelled) return;

      if (profileError || coupleError) {
        setPhase('error');
        return;
      }

      setProfile({
        nickname: profileRow?.nickname ?? '익명',
        coupleStatus: coupleRow?.status ?? null,
        inviteCode: coupleRow?.invite_code ?? null,
      });
      setPhase('ready');
    })();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const handleLogout = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    // Boot gate at `/login` needs no further redirect logic — signing out has
    // no session, so re-entering `/` would only bounce back here anyway.
    router.replace('/login');
  };

  const statusCopy = (() => {
    if (!profile) return '';
    if (profile.coupleStatus === 'connected') return '💞 파트너와 연결됨';
    if (profile.coupleStatus === 'pending') {
      return `파트너 연결 대기 중 · 초대코드 ${profile.inviteCode ?? ''}`;
    }
    return '아직 커플 연결 전이에요.';
  })();

  return (
    <ScreenView edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <AppText variant="title">프로필</AppText>

        {phase === 'loading' && (
          <AppText variant="caption" color="secondary">
            불러오는 중…
          </AppText>
        )}

        {phase === 'error' && (
          <View style={styles.errorState}>
            <AppText variant="caption" color="danger">
              정보를 불러오지 못했어요.
            </AppText>
            <Button size="sm" variant="ghost" fullWidth={false} onPress={() => setRetryCount((c) => c + 1)}>
              다시 시도
            </Button>
          </View>
        )}

        {phase === 'ready' && profile && (
          <>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <AppText variant="bodyStrong">{profile.nickname}</AppText>
              <AppText variant="caption" color="secondary">
                {statusCopy}
              </AppText>
            </View>

            <View style={styles.section}>
              <AppText variant="bodyStrong">테마</AppText>
              <ThemeToggle />
            </View>
          </>
        )}

        <View style={styles.footer}>
          <Button variant="ghost" onPress={handleLogout} disabled={signingOut}>
            {signingOut ? '로그아웃 중…' : '로그아웃'}
          </Button>
        </View>
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.space[5],
    paddingTop: theme.space[4],
    gap: theme.space[6],
  },
  errorState: {
    gap: theme.space[3],
  },
  card: {
    borderWidth: 1,
    borderRadius: theme.radius.xl,
    padding: theme.space[4],
    gap: theme.space[1],
  },
  section: {
    gap: theme.space[3],
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: theme.space[4],
  },
});
