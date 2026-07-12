---
status: doing
last-updated: 2026-07-12
owner: planner
---

# 모바일 앱(Expo) — 웹 동일 핵심 흐름 이식 계획

> **진행: STEP 0~4 완료(환경·테마·OAuth·커플연결·탭 셸+피드+프로필).** 다음 = STEP 5(상세+사진 갤러리+지도 WebView). STEP 2 실기기 검증만 Blocked(딥링크 등록).
>
> 소유 실행: **app-dev**(apps/mobile 전 구현). 검증: **build-qa**(build/lint/typecheck/스모크) · **uiux-reviewer**(디자인/접근성) · **reviewer**(규칙/중복).
> 연관: `apps/mobile/CLAUDE.md`(로컬 규칙) · `docs/plan/08-theme-tokens.md`(mobile 다크 소비 후속) · `DESIGN.md`(웜 뉴트럴/토스풍) · `packages/shared`(Zod) · `supabase/SCHEMA.md`(DB·RLS) · 웹 라우트(`apps/web/src/app`).
> 이 문서는 `docs/PROGRESS.md` `## 다음` 4번 항목의 상세 계획서다.

## 목표

apps/web에 이미 완성된 커플 기록 핵심 흐름을 **모바일 네이티브(Expo Router + React Native)** 로 이식한다. 웹과 **별도 구현**(RN 프리미티브)이되, `@maps/tokens`(테마)·`@maps/shared`(Zod)·Supabase DB/RLS는 그대로 공유한다. 지도는 Kakao Map(모바일은 WebView 기반). 08 테마 전환의 mobile 후속(라이트/다크 `theme.ts` 소비 정렬)을 포함한다.

**웹에서 이식할 흐름(단일 진실):**
`/login`(Kakao/Google 소셜) → OAuth 콜백(딥링크) → `/couple/connect`(초대코드) → 홈 피드 → 로그 상세(장소·평점·메모·경로·사진 갤러리) → `/map` 전체지도 → `/calendar` → `/profile`. **작성(`/logs/new`, 다중 사진)은 STEP 6(후속) 로 분리** — 아래 "범위 판단" 참고.

## 범위 판단 (Phase 1 vs 후속)

- **Phase 1 (STEP 1~5, 뷰 중심):** 로그인 → 커플 연결 → 피드 → 상세(사진 갤러리 **보기** 포함) → 지도/캘린더/프로필. 커플이 **웹에서 작성한 기록을 폰에서 되돌아보는** 소비 경험을 먼저 완성한다.
- **후속 (STEP 6, 작성):** `logs/new` 다중 사진 작성은 `expo-image-picker`(사진 선택) + Supabase Storage 업로드 + **Kakao 장소검색(REST 키/프록시 필요)** 이 전제라 무게가 크다. Phase 1 안정 후 별도 착수. **"사진"의 Phase 1 범위 = 상세 화면 갤러리 열람**이고, **사진 업로드(작성)는 STEP 6**임을 명시한다. (열린 질문 1 확정 필요.)
- **명시적 제외(당분간):** 공개 탐색(`/explore`·`/places`·`/explore/regions`)·AdSense·커뮤니티(06)는 웹 전용 공개표면 → 모바일 미포함. 모바일은 로그인 게이트 뒤 커플 사적 기록에 집중.

## 현재 mobile 코드 진단 (2026-07-12)

morun 복제 잔재는 대부분 청산됐고, 지금은 **거의 빈 스캐폴드**다.

**있는 것 (동작 확인 필요):**
- `app/_layout.tsx` — `Stack`(headerShown:false) + `SafeAreaProvider` + `GestureHandlerRootView` + `StatusBar dark`. ⚠️ `contentStyle.backgroundColor: '#FFFFFF'` **하드코딩**(토큰 규칙 위반 → STEP 1에서 교체).
- `app/index.tsx` — 브랜드 스플래시류 화면. ⚠️ 로고 텍스트가 `"maps"`(브랜드 rebrand "위로그" 미반영), `fontSize:42/fontWeight:'800'` 등 **매직넘버**(theme.font 미경유). `colors.brand`/`colors.textSecondary` 직접 소비(라이트 고정, 다크 미대응).
- `src/lib/supabase.ts` — `@supabase/supabase-js` + `AsyncStorage` 세션 영속 + `detectSessionInUrl:false`(RN에 맞음) + `db.schema`(EXPO_PUBLIC_SUPABASE_DB_SCHEMA). **RN OAuth 딥링크에 그대로 재사용 가능.** 손댈 필요 낮음.
- `src/components/{atoms,molecules,organisms,templates}/index.ts` — **전부 빈 배럴**(컴포넌트 0개).
- `.env.example` — `EXPO_PUBLIC_SUPABASE_URL/ANON_KEY/DB_SCHEMA` · `EXPO_PUBLIC_API_URL` · `EXPO_PUBLIC_KAKAO_MAP_KEY`. Supabase/Kakao 키 자리 준비됨.
- `app.json` — `scheme:"maps"`(딥링크용, ✅), `newArchEnabled:true`, plugins `expo-router`/`expo-font`, `typedRoutes:true`. `name/slug:"maps"`(rebrand 미반영은 후순위).
- `package.json` — expo ~52 / RN 0.76.9 / react 18.3.1 / expo-router ~4 / expo-linking / gesture-handler / reanimated / safe-area / screens / svg / zustand / axios. **미설치(STEP 0에서 추가): `react-native-webview`(Kakao 지도) · `expo-web-browser`+`expo-auth-session`(OAuth 딥링크) · `expo-image-picker`(STEP 6 작성).**

**비어있는 것:** 라우트 그룹(`(auth)`/`(tabs)`) 전무, 컴포넌트 전무, 테마 provider 전무, 지도 전무, 커플 연결 전무.

**morun 잔재:** 화면 레벨엔 없음(index만 커플 태그라인). 08에서 토큰 잔재는 이미 청산됨. 남은 위생 이슈는 index/_layout의 하드코딩뿐.

**환경 이슈(선행):** 로컬 `expo export`가 `Cannot find module 'babel-preset-expo'`로 실패 중(node_modules 링크 누락, 코드 회귀 아님). **STEP 0에서 `bun install` 재링크부터.**

## 데이터모델 (신규 없음 — 웹/공유 재사용)

모바일은 **새 엔티티를 만들지 않는다.** `@maps/shared`의 Zod(`profile`/`couple`/`place`/`dateLog`/`dateLogPlace`/`createDateLog`/`dateLogPhoto`) + `supabase/SCHEMA.md`의 테이블(`profiles`/`couples`/`places`/`date_logs`/`date_log_places`/`routes`/`date_log_photos`) + `date-photos` 버킷을 그대로 소비. RLS가 커플 스코프를 강제하므로 모바일도 Supabase 직접 호출로 동일 보호를 받는다.

## 화면 목록 (웹 대응)

| 모바일 라우트 | 웹 대응 | 내용 |
| --- | --- | --- |
| `app/index.tsx` | (부팅) | 세션/커플 상태 판정 후 리다이렉트(로그인/커플연결/탭홈) |
| `app/(auth)/login.tsx` | `/login` | Kakao/Google OAuth(딥링크) |
| `app/(auth)/couple-connect.tsx` | `/couple/connect` | 초대코드 생성/입력 |
| `app/(tabs)/home.tsx` | 홈 피드 | 커플 date-log 카드 리스트 |
| `app/(tabs)/map.tsx` | `/map` | 전체 방문 장소 마커(WebView) |
| `app/(tabs)/calendar.tsx` | `/calendar` | 월별 기록 캘린더 |
| `app/(tabs)/profile.tsx` | `/profile` | 닉네임·커플상태·테마토글·로그아웃 |
| `app/logs/[id].tsx` | `/logs/[id]` | 상세: 장소·평점·메모·경로 지도·사진 갤러리 |
| `app/logs/new.tsx` (STEP 6) | `/logs/new` | 작성(다중 사진·장소검색) — 후속 |

## API / 데이터 접근

- **Supabase 직접 호출**(`src/lib/supabase.ts`) — 웹과 동일 쿼리 패턴. 컨트롤러/서버 경유 아님(RLS가 보호).
- 커플 연결: `join_couple` RPC(초대코드) — 웹 `/couple/connect` 로직 미러.
- 지도: Kakao Map **JS SDK를 WebView 안에서** 로드(모바일 네이티브 SDK 없음). 아래 기술 결정 참고.
- 장소검색(STEP 6): Kakao Local REST — REST 키 or `api` 프록시(미배포). STEP 6 전제.

## 단계별 작업 순서 (STEP = 세션 경계)

> 각 STEP은 한 세션에서 끝낼 수 있는 단위. 구현은 전부 **app-dev**. 완료 시 build-qa 스모크 후 커밋. STEP 1이 백엔드 의존 없는 자기완결 첫 조각이라 **바로 착수 가능**.

### STEP 0 — 환경 복구 & 위생 (app-dev) [선행]
- `bun install`로 `babel-preset-expo` 재링크 → `expo start`/`expo export` 스모크 복구.
- 의존성 추가: `react-native-webview`(지도), `expo-web-browser`+`expo-auth-session`(OAuth). (`expo-image-picker`는 STEP 6에서.)
- `.env` 실값 확인(`EXPO_PUBLIC_SUPABASE_ANON_KEY`·`EXPO_PUBLIC_KAKAO_MAP_KEY`(JS 키)). `.env.example`에 필요 시 `EXPO_PUBLIC_KAKAO_REST_KEY`(STEP 6용) 자리 추가.
- 브랜드 rename: index 로고 `"maps"`→`"위로그"`(로고는 08에서 웹은 주아 워드마크 — 모바일 폰트 배선은 STEP 1에서 판단, 우선 텍스트만).
- **완료 기준:** Expo Go(또는 dev build)에서 앱 부팅, typecheck/lint PASS.

### STEP 1 — 테마 기반 (app-dev, 08 후속) [백엔드 무의존, 첫 착수 권장]
- **mobile ThemeProvider**: `src/lib/theme.tsx` — `useColorScheme`(시스템) + 사용자 선택(system/light/dark) AsyncStorage 저장 + `useTheme()` 훅이 `theme.color`(라이트) / `theme.colorDark`(다크) 중 하나를 반환. `@maps/tokens`의 `theme.ts` 라이트/다크 변형을 **그대로 소비**(웹과 동일 시맨틱 키).
- `_layout.tsx` 하드코딩 `#FFFFFF` → theme 배경으로, `StatusBar` 스타일 테마 연동, Provider 배선.
- `index.tsx` 매직넘버 → `theme.font.*`/`theme.color.*` 경유로 리팩터.
- **기초 atoms**: `ScreenView`(SafeArea+테마 배경 템플릿성 wrapper), `AppText`(theme.font.style 소비 타이포), `Button`(lg/md/sm, Pressable+press/opacity, 토큰), `TextField`(TextInput+테마). barrel(`index.ts`) 등록.
- **완료 기준:** 시스템/라이트/다크 전환이 화면에 반영, 하드코딩/매직넘버 0, atoms 배럴 노출.

### STEP 2 — 인증(OAuth 딥링크) (app-dev)
- `app/(auth)/login.tsx` — Kakao/Google 버튼. 흐름(아래 기술 결정): `signInWithOAuth({skipBrowserRedirect:true, redirectTo})` → `WebBrowser.openAuthSessionAsync(url, redirectTo)` → 반환 URL의 `code` 파싱 → `exchangeCodeForSession`. 세션은 AsyncStorage에 영속(이미 배선).
- 로그인 성공 후 프로필 upsert(웹 `/auth/callback` 로직 미러: nickname·avatar_url).
- `app/index.tsx` 부팅 게이트: 세션 없음→login, 세션 있고 커플 없음→couple-connect, 있으면→(tabs)/home.
- **완료 기준:** 실기기에서 Kakao/Google 로그인→세션 유지→재실행 시 로그인 유지.

### STEP 3 — 커플 연결 (app-dev) [완료 `bc040e6`]
- `app/(auth)/couple-connect.tsx` — 웹 미러: 내 초대코드 생성/표시(복사) + 상대 코드 입력→`join_couple`. 성공 시 (tabs)/home.
- 커플 상태에 따른 부팅 게이트(STEP 2와 연결) — no-couple 분기 `router.replace` 실연결.
- **reviewer Med1 반영:** 커플 보유 시 join 폼 노출→이중 소속 가능 → **웹·모바일 양쪽 join 폼 숨김**(+ DB 방어는 `0011_join_couple_guard`). typecheck/lint/expo export PASS.
- **완료 기준(코드):** 화면·부팅게이트·RPC 조인 완료. 두 계정 실테스트는 웹 Blocked 항목과 겸함(실기기).

### STEP 4 — 탭 셸 + 피드 + 프로필 (app-dev) [완료]
- `app/(tabs)/_layout.tsx` — 하단 탭(home/map/calendar/profile), 웹 BottomNav IA 미러. expo-router `Tabs`(내부 `@react-navigation/bottom-tabs`) + 신규 `Icon` atom(단일 path stroke-svg, 웹 `BottomNav`의 `I(d)` 헬퍼 미러).
- `home.tsx` — 커플 date-log 조회(`date_logs` + `date_log_places(places)`, RLS가 커플 스코프 자동 적용 — 웹 `page.tsx`와 동일 패턴) + 커버사진 서명 URL(`date-photos` 버킷) → 신규 `DateLogCard`(molecule, RN판: `CoverFallback`/`HeartRating`/`Tag` atom 신규 + RN `Image`). 로딩/에러(재시도)/빈 상태 처리.
- `map.tsx`/`calendar.tsx` — STEP 5에서 채울 자리표시자 스크린(탭 셸이 실제로 동작하려면 파일이 있어야 함). "곧 연결돼요 (STEP 5)" 카피만.
- `profile.tsx` — 닉네임·커플상태·**테마 토글**(신규 `ThemeToggle` molecule, 3-way 세그먼트, STEP 1 `useTheme` 소비)·로그아웃. 아바타 편집(11번 계획)은 범위 밖 — 잔여로 유지.
- 부팅 게이트(`app/index.tsx`) connected 분기를 `router.replace('/home')`로 실연결(`BootState` 'connected' 플레이스홀더 제거).
- **완료 기준:** 웹에서 만든 기록이 폰 피드에 뜸, 탭 이동, 로그아웃 동작. typecheck/lint/`expo export` PASS.

### STEP 5 — 상세 + 사진 갤러리 + 지도(WebView) (app-dev)
- `app/logs/[id].tsx` — 장소 리스트(순서/평점/메모) + 사진 갤러리(열람) + 경로 지도.
- **KakaoMap organism(RN/WebView)**: HTML 문자열에 Kakao JS SDK 로드 → 마커 + 경로 Polyline 렌더. 웹 `KakaoMap.tsx`의 마커/폴리라인 로직 이식(경로선 색은 08 후속대로 accent 직접소비 지양, brand/뉴트럴 정렬). `map.tsx` 탭은 전체 마커 뷰.
- `calendar.tsx` — 월별 기록.
- **STEP 4 reviewer Low 2건 후속(이 STEP에서 함께 처리):** ① 홈 탭 세션만료 시 로그인 리다이렉트 비대칭(profile은 가드 있음 → home도 동일 가드 정렬). ② 탭 포커스 재조회/`RefreshControl` 없음(피드 stale — `useFocusEffect` 재조회 + pull-to-refresh 추가).
- **완료 기준:** 상세에서 지도(마커/경로)·사진 갤러리·평점·메모 표시, 지도 터치 팬/줌 동작.

### STEP 6 — 작성(logs/new, 다중 사진) (app-dev) [후속, 확정 후]
- `expo-image-picker` 다중 선택 → Supabase Storage(`date-photos`) 업로드(웹 경로 규칙 미러) → `date_logs`/`date_log_places`/`date_log_photos` insert. 공개 토글.
- Kakao 장소검색(REST 키/프록시) — 전제 미충족 시 STEP 5.5로 좌표 수동/생략 대안 검토.
- **완료 기준:** 폰에서 작성한 기록이 웹·폰 양쪽 피드에 반영.

### 검증 (각 STEP 후)
- **build-qa**: `bun install` 후 typecheck/lint, `expo export` 스모크, 부팅/핵심 흐름 회귀.
- **uiux-reviewer**: 웜뉴트럴/토스풍 일관성·다크 대비·44px 터치타깃·SafeArea·접근성.
- **reviewer**: atomic 규칙(하향 import·프리미티브)·토큰 경유·중복(웹 로직과 스키마 공유 여부).

## 기술 결정 사항

1. **Supabase OAuth 딥링크(모바일):** `detectSessionInUrl:false`(RN, 이미 설정) 전제. `signInWithOAuth({ provider, options: { skipBrowserRedirect: true, redirectTo } })`로 URL만 받아 `WebBrowser.openAuthSessionAsync(url, redirectTo)`로 인앱 브라우저 열기 → 리다이렉트 URL의 `code`를 `AuthSession`/`Linking`으로 파싱 → `supabase.auth.exchangeCodeForSession(code)`. `redirectTo`는 `AuthSession.makeRedirectUri({ scheme: 'maps', path: 'auth/callback' })`(app.json `scheme:"maps"` 사용). **Supabase Auth redirect allow-list + Kakao/Google 콘솔 redirect URI에 딥링크(및 Expo Go의 `exp://` 프록시) 등록 필요 → 열린 질문 3.**
2. **Kakao Map = WebView:** 카카오는 공식 RN SDK가 없다. `react-native-webview` 안에서 Kakao JS SDK(`EXPO_PUBLIC_KAKAO_MAP_KEY` = **JS 키**)를 HTML로 로드해 마커/경로 렌더. RN↔WebView는 `postMessage`로 마커 데이터 주입. 웹 `KakaoMap.tsx`의 마커/bounds/Polyline 로직을 HTML 안 JS로 이식.
3. **env(`EXPO_PUBLIC_*`):** 브라우저 노출 규칙상 공개키만. 현재: `SUPABASE_URL`/`ANON_KEY`/`DB_SCHEMA`/`API_URL`/`KAKAO_MAP_KEY`. STEP 6에서 `KAKAO_REST_KEY`(장소검색) 추가 검토. 런타임 노출은 `process.env.EXPO_PUBLIC_*` 직접 또는 `expo-constants` extra(mobile CLAUDE.md 권고) — 팀 일관성 위해 supabase.ts 기존 방식(`process.env`) 따름.
4. **Atomic Design(모바일):** `src/components/{atoms,molecules,organisms,templates}`. 프리미티브 `Pressable`/`TextInput`/`Text`/`View`만(웹 `<button>`/`<input>` 금지). `StyleSheet.create` + `@maps/tokens`(매직넘버 금지). **웹과 `.tsx` 공유 금지** — 별도 구현. 하향 import만.
5. **테마 소비(08 후속):** 웹은 CSS 변수로 런타임 전환하지만 RN엔 CSS가 없다 → **JS 컨텍스트(ThemeProvider)** 로 `theme.color`↔`theme.colorDark` 스왑(STEP 1). `StyleSheet`는 정적이므로 색은 컴포넌트 내 `useTheme()` 값으로 인라인/동적 스타일 병합(구조는 StyleSheet, 색만 테마 주입).
6. **테스트/배포 수단:** WebView + 딥링크 OAuth는 Expo Go에서 제약이 있을 수 있어 EAS **dev build** 권장 여부 확정 필요 → 열린 질문 5.

## 열린 질문 (사용자 확정 필요)

1. **작성(logs/new) Phase 1 포함?** 계획은 STEP 6(후속) 분리 — 뷰 우선. Phase 1에 넣을지 확정. (권장: 후속.)
2. **Kakao Map WebView 방식 승인?** 네이티브 SDK 없음 → WebView가 사실상 유일 현실안. 승인만 확인.
3. **OAuth 딥링크 대시보드 등록** — 사용자가 (a) Supabase Auth redirect allow-list에 딥링크 추가, (b) Kakao/Google OAuth 콘솔 redirect URI 추가 필요. Expo Go(`exp://` 프록시) vs dev build(`maps://`) 중 어느 것을 등록 대상으로 할지.
4. **장소검색 키(STEP 6):** Kakao REST 키 발급 vs `api` 프록시(map-api.weourus.xyz, 미배포) 완성 대기. 어느 경로로.
5. **테스트 수단:** Expo Go로 충분한지, EAS dev build를 낼지(WebView/딥링크 제약 시).
6. **공개 탐색/커뮤니티 모바일 제외 확인** — Phase 1은 로그인 게이트 뒤 커플 사적 기록만. explore/places/community 미포함 확정.

## 완료 기준 (Phase 1)

- 실기기에서 Kakao/Google 로그인 → 세션 영속 → 커플 연결 → 피드 → 상세(지도·사진·평점·메모) → 지도/캘린더/프로필 동작.
- 라이트/다크/시스템 테마 전환 반영, `@maps/tokens` `theme.ts` 소비, 하드코딩/매직넘버 0.
- Atomic Design 준수(프리미티브·하향 import·웹 미공유), `@maps/shared` 스키마 재사용(중복 0).
- build-qa 회귀(typecheck/lint/expo export) PASS, uiux/ reviewer 지적 반영.
</content>
</invoke>
