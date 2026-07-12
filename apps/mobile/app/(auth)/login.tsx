import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { theme, colors } from '@maps/tokens';
import { ScreenView, AppText, OAuthButton } from '@/components/atoms';
import { useTheme } from '@/lib/theme';
import { signInWithProvider, type OAuthProvider } from '@/lib/auth';

const IDLE_LABEL: Record<OAuthProvider, string> = {
  kakao: '카카오로 시작하기',
  google: 'Google로 시작하기',
};

const LOADING_LABEL: Record<OAuthProvider, string> = {
  kakao: '카카오로 이동 중…',
  google: 'Google로 이동 중…',
};

// Kakao's brand guideline mandates this exact yellow/near-black pair for its
// login button — mirrors `apps/web/src/app/(auth)/login/page.tsx`.
const KAKAO_BG = '#FEE500';
const KAKAO_FG = '#191600';

/**
 * `/login` — Kakao/Google OAuth (docs/plan/09-mobile.md STEP 2). Deep-link
 * flow lives in `src/lib/auth.ts`; this screen only owns loading/error UI.
 */
export default function LoginScreen() {
  const { colors: themeColors } = useTheme();
  const [loading, setLoading] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (provider: OAuthProvider) => {
    setError(null);
    setLoading(provider);
    const result = await signInWithProvider(provider);
    setLoading(null);

    if (result.status === 'success') {
      // Re-enter the boot gate at `/` — it re-reads the session (now set)
      // and decides couple-connect vs. home (STEP 3/4).
      router.replace('/');
      return;
    }
    if (result.status === 'error') {
      setError(result.message);
    }
    // 'cancelled' — user backed out of the in-app browser; stay quiet.
  };

  return (
    <ScreenView>
      <View style={styles.container}>
        <View style={styles.brand}>
          <AppText variant="displayLarge" color="brand">
            위로그
          </AppText>
          <AppText variant="body" color="secondary" style={styles.tagline}>
            {'둘이 함께한 순간을 기록해요.\n소셜 계정으로 시작하기.'}
          </AppText>
        </View>

        {error && (
          <View
            style={[
              styles.errorBox,
              { backgroundColor: `${themeColors.danger}1A`, borderColor: `${themeColors.danger}4D` },
            ]}
          >
            <AppText variant="caption" color="danger" style={styles.errorText}>
              {error}
            </AppText>
          </View>
        )}

        <View style={styles.actions}>
          <OAuthButton
            label={loading === 'kakao' ? LOADING_LABEL.kakao : IDLE_LABEL.kakao}
            onPress={() => signIn('kakao')}
            disabled={loading !== null}
            bg={KAKAO_BG}
            fg={KAKAO_FG}
          />
          <OAuthButton
            label={loading === 'google' ? LOADING_LABEL.google : IDLE_LABEL.google}
            onPress={() => signIn('google')}
            disabled={loading !== null}
            bg="#FFFFFF"
            fg={colors.textPrimary}
          />
        </View>

        <AppText variant="caption" color="muted" style={styles.terms}>
          계속 진행하면 서비스 약관에 동의하는 것으로 간주됩니다.
        </AppText>
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
  brand: {
    alignItems: 'center',
    gap: theme.space[2],
  },
  tagline: {
    textAlign: 'center',
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: theme.radius.xl,
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[4],
  },
  errorText: {
    textAlign: 'center',
  },
  actions: {
    gap: theme.space[3],
  },
  terms: {
    textAlign: 'center',
  },
});
