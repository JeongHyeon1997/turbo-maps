import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { theme } from '@maps/tokens';
import { useTheme } from '@/lib/theme';
import { AppText } from '@/components/atoms';
import { buildKakaoMapHtml, type KakaoMapMarker } from '@/lib/kakao/build-map-html';

export type MapMarker = KakaoMapMarker;

export interface KakaoMapProps {
  markers: MapMarker[];
  height?: number;
  /** Draw a polyline through `markers` in order. Defaults to `true` (mirrors web `KakaoMap`). */
  route?: boolean;
}

type Status = 'loading' | 'ready' | 'error';

const NO_KEY_MESSAGE = '지도를 사용하려면 카카오 지도 키가 설정돼야 해요.';
const LOAD_ERROR_MESSAGE = '지도를 불러오지 못했어요. 잠시 후 다시 시도해주세요.';
const LOADING_MESSAGE = '지도를 불러오는 중…';

/**
 * Kakao Map rendered inside a `WebView` (docs/plan/09-mobile.md "기술 결정
 * 사항" #2 — Kakao has no native RN SDK). Mirrors web `KakaoMap`'s marker/
 * bounds/route-line behavior (`apps/web/src/components/organisms/KakaoMap.tsx`),
 * reimplemented as an inline HTML document (`buildKakaoMapHtml`). The route
 * line uses `colors.brand` (not the retired `accentPalette.coral`, which
 * web's own `KakaoMap` still uses) per DESIGN.md "지도 UI" (brand 계열 +
 * 뉴트럴로 통일 — web's own swap is tracked as 08-risk-#2 tech debt, not
 * repeated here).
 *
 * Two independent failure modes get the same graceful text fallback:
 * missing `EXPO_PUBLIC_KAKAO_MAP_KEY` (never mounts a WebView at all) and a
 * WebView/SDK load failure at runtime (`onError`/`onHttpError`/the page's own
 * `postMessage('error')` when the SDK script itself fails inside the page).
 */
export function KakaoMap({ markers, height = 260, route = true }: KakaoMapProps) {
  const { colors } = useTheme();
  const [status, setStatus] = useState<Status>('loading');
  const appKey = process.env.EXPO_PUBLIC_KAKAO_MAP_KEY;

  const html = useMemo(() => {
    if (!appKey) return null;
    return buildKakaoMapHtml({
      appKey,
      markers,
      route,
      routeColor: colors.brand,
      backgroundColor: colors.surfaceAlt,
    });
  }, [appKey, markers, route, colors.brand, colors.surfaceAlt]);

  const frameStyle = [styles.frame, { height, borderColor: colors.border, backgroundColor: colors.surfaceAlt }];

  if (!html) {
    return (
      <View style={[frameStyle, styles.centered]}>
        <AppText variant="caption" color="secondary" style={styles.messageText}>
          {NO_KEY_MESSAGE}
        </AppText>
      </View>
    );
  }

  return (
    <View style={frameStyle}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        // The inline document never navigates (SDK scripts/tiles are
        // subresources, not navigations) — block anything that tries, so a
        // compromised payload can't steer the WebView to an external page.
        onShouldStartLoadWithRequest={(request) =>
          request.url === 'about:blank' || request.url.startsWith('data:')
        }
        style={styles.webview}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data) as { type?: string };
            if (data.type === 'ready') setStatus('ready');
            else if (data.type === 'error') setStatus('error');
          } catch {
            // Malformed payload — ignore, keep the current status.
          }
        }}
        onError={() => setStatus('error')}
        onHttpError={() => setStatus('error')}
      />
      {status !== 'ready' && (
        <View style={[styles.overlay, styles.centered]} pointerEvents="none">
          <AppText variant="caption" color="secondary" style={styles.messageText}>
            {status === 'error' ? LOAD_ERROR_MESSAGE : LOADING_MESSAGE}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: 1,
    borderRadius: theme.radius['2xl'],
    overflow: 'hidden',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.space[4],
  },
  webview: {
    flex: 1,
    // WebView defaults to opaque white otherwise, flashing before the page's
    // own <style> background (backgroundColor above) has a chance to paint.
    backgroundColor: 'transparent',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  messageText: {
    textAlign: 'center',
  },
});
