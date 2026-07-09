/**
 * maps 디자인 토큰 - 타이포그래피
 *
 * 본문·헤딩·UI·숫자 = **Pretendard** (`sans`/`display`). system sans 폴백.
 * **주아체(BMJUA) = 로고 워드마크(위로그) 전용** (`logo`). 웹은 next/font/local로
 * self-host 하여 `--font-jua` CSS 변수로 노출하고 `logo`가 그 변수를 참조한다.
 * 제품 UI(헤딩/본문/버튼/숫자)에는 절대 쓰지 않는다.
 * 한나3(BMHANNA)·꾸불림(BMKkubulim)은 제품 UI 미사용 — 배선하지 않는다.
 */
export const fontFamily = {
  sans: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  display: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
  /** Logo wordmark only (BMJUA). Web fills the `--font-jua` var via next/font/local. */
  logo: 'var(--font-jua), Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 17,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
} as const;

export const lineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.65,
} as const;

export const textStyle = {
  // Weight hierarchy: bold(700) headings + regular/medium body. extrabold is
  // reserved for the logo wordmark only — headings step down to bold.
  displayLarge: {
    fontFamily: fontFamily.display,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
  },
  title: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.snug,
  },
  subtitle: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
  },
  body: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
  },
  bodyStrong: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal,
  },
  caption: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
  },
  button: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.snug,
  },
} as const;
