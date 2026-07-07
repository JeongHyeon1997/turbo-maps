# PROGRESS — 2026-07-07 기준

> 새 세션은 이 파일을 먼저 읽는다. `## 다음` 맨 위 항목부터 집어든다.
> 형식 규칙은 `docs/README.md`.

## 완료 (Done)
- [x] 모노레포 스캐폴딩 (Bun+Turborepo, apps/web·api·mobile, packages/shared·tokens) — morun 구조 복제 후 커플 도메인으로 정리
- [x] Supabase 연결 배선 (project `giilijttitajvygdosbe`) + `.env` (gitignore) + Kakao JS 키
- [x] 워밍한 디자인 방향 초안 (`DESIGN.md`) + 토큰 warm 팔레트 반영
- [x] 10개 역할 에이전트 (`.claude/agents/`) — dba 추가
- [x] docs 이어가기 프로토콜 정립 (`docs/README.md`)
- [x] 웹 로컬 실행 확인 (localhost:3000)
- [x] 첫 웹 화면: 홈 피드 (Atomic 컴포넌트 + 토큰 + 목업) — **반응형**(모바일 1열 / PC 2~3열 그리드 + 상단 내비)
- [x] Vercel 프로젝트 연결 + env 밀어넣기: `maps-web`·`maps-api` (production/development). 시크릿은 api에만. 스크립트: `scripts/{sync,pull}-env-*.sh`

## 진행중 (Doing)
- [ ] 인증+커플 수직 슬라이스. 코드 완성(아래 완료), **막힘 2건** 남음 → Blocked 참고.

## 완료 (이번 슬라이스)
- [x] db-dev: `0001_init` 마이그레이션 작성 (profiles/couples + 초대코드 join_couple 함수 + RLS, public/test) — SCHEMA.md 갱신
- [x] schema-dev: `@maps/shared` profile/couple Zod 스키마
- [x] web-dev: 소셜로그인 페이지(`/login`, Kakao/Google) + `/auth/callback`(세션교환+프로필 upsert) + 세션 미들웨어 + `/couple/connect`(초대코드 생성/입력)
- [x] Kakao 로그인 실동작 (동의항목 nickname/email/image, Redirect URI 등록 완료)
- [x] DB 0002 적용 (places/date_logs/date_log_places/routes + date-photos 버킷) + 공유 스키마
- [x] **배포: `maps-web` → blueteams 팀, GitHub 자동배포, `maps.weourus.xyz` 라이브** (Root Directory=apps/web)

## 이번에 완료
- [x] 전체 지도 `/map`, 캘린더 `/calendar`
- [x] 퍼블릭 공간 `/explore` + 0004(visibility) 공개 RLS + 작성 시 공개 토글 (메모 비공개)
- [x] 모바일 하단 네비 `BottomNav`, 내정보 `/profile`(닉네임 수정·커플상태·로그아웃)
- [x] 대표 사진 썸네일(0003) + hydration/UX 수정들

## 이번에 완료 (서버)
- [x] **maps-api 서버리스 배포 성공** — `apps/api/api/index.ts`(Express 어댑터) + `vercel.json`(public 출력 + rewrite), Root Directory=apps/api, Framework=Other
- [x] `https://map-api.weourus.xyz/api/health` = 200, `/api/health/db` = ok(Supabase 연결 확인)

## 이번에 완료 (인증)
- [x] **prod Kakao 로그인 localhost 리다이렉트 버그 수정** — Supabase Auth → URL Configuration의 Redirect URLs 허용목록에 `https://maps.weourus.xyz/**`(+ `https://*.vercel.app/**`, `maps://**`) 추가. redirectTo가 허용목록에 없어 Site URL(localhost)로 폴백되던 문제. 재현용 스크립트 `scripts/set-auth-urls.ts` (Management API, SBP_TOKEN).

## 이번에 완료 (웹)
- [x] **기록 상세 페이지 `/logs/[id]`** — 서버 컴포넌트. date_log 단건(장소·평점·장소별 메모·경로 좌표) 조회 + 커버 서명 URL, 커버/메모/KakaoMap(경로 좌표 우선, 없으면 장소 마커)/방문 장소 리스트. RLS 커플 스코프, 없는 row → notFound(). 신규 `VisitedPlaceItem` molecule. 피드 카드·캘린더 항목에서 진입 링크 연결.

## 이번에 완료 (사진)
- [x] **사진 갤러리 — 기록당 여러 장** — DB `0005_date_log_photos`(커플 스코프 RLS, public/test 미러) + `@maps/shared` Zod(`dateLogPhotoSchema`/`createDateLogPhotoSchema`) + `/logs/new` 다중 업로드(best-effort) + `PhotoGallery` organism·`PhotoThumb` molecule + `/logs/[id]` 서명·sort_order 갤러리. **단, 0005 라이브 미적용 → Blocked 참고.** (단일 커버 업로드는 이전부터 동작 중)

## 이번에 완료 (브랜드·인증)
- [x] **브랜드 "We Log"로 rebrand** — layout 메타데이터(title 템플릿 `%s · We Log`, description, OpenGraph, metadataBase), 로그인 h1, AppHeader(홈 링크화), web package.json. `@maps/*` 패키지 스코프는 내부명이라 유지.
- [x] **인증 보강 (SSO 대응)** — 미들웨어 중앙 라우트 가드(비로그인→`/login?redirect=`, 로그인 상태로 `/login`→홈, 리프레시된 쿠키 리다이렉트에 보존) / 로그인 페이지 에러·상태 표시 + `signInWithOAuth` 실패 시 UI 복구(“이동 중…” 멈춤 해결) + 복귀경로 `?next=` 전달 / 콜백 provider error(동의 거부 등) → `?error=oauth`.
- [x] **Kakao Web 플랫폼 도메인 반영 확인** — prod에서 지도 렌더 + 로그인 동작 확인됨(도메인 등록 정상).

## 이번에 완료 (공개 표면 1단계)
- [x] **🎯 공개 랜딩 `/` + `/privacy` + `/terms`** — 미들웨어 `/` exact-only public(+`/privacy`·`/terms`), `/` 세션 분기(비로그인=랜딩 hero/features/공개코스 미리보기+폴백, 로그인=기존 피드), 정책 페이지(AdSense 쿠키·제3자 광고 고지 포함). 신규 컴포넌트: Logo atom / FeatureCard·PolicySection·PolicyList·EmptyState molecule / Landing{Header,Hero,Features}·ExplorePreview·SiteFooter·PolicyDocument organism / PublicShell template. build+lint+typecheck 통과. (`docs/plan/04-public-surface.md` 1단계)

## 이번에 완료 (공개 표면 2단계 web)
- [x] **web-dev: /explore 공개화 + copy-on-publish** — 미들웨어 `/explore` public / `/explore`·랜딩 미리보기를 anon 안전 뷰(`explore_logs`+`explore_log_places`) 기반 조회로 전환(공통 `lib/explore.ts`의 `getPublicExploreLogs`, 뷰 미적용 시 `[]`로 graceful degrade) / 공개 커버는 `public-covers` 무토큰 URL(`lib/storage/public-cover-url.ts`), 없으면 그라데이션 폴백 / 기록 생성 시 공개+커버면 `public-covers`에 best-effort 복사 후 `public_cover_path` 저장. web typecheck+lint+build 통과. (commit 2b9bb04, bae9dd9) (plan: docs/plan/04-public-surface.md 2단계)
  - 남음: **0006(+0005) 라이브 적용 전엔 explore가 빈 상태**(의도된 degrade). 적용되면 코드 변경 없이 켜짐. 비공개 전환/삭제 시 공개 복사본 정리는 편집/삭제 UI가 생길 때 후속.

## 이번에 완료 (커플 아바타)
- [x] **web-dev: 헤더 파트너 아바타 실제 표시** — AppShell(async)이 로그인 유저+파트너 profiles 조회해 실제 아바타(이니셜+`avatar_url` 이미지)를 AppHeader에 전달, 에러 시 본인만/무세션이면 로그인 링크(/explore 공개 대응) / Avatar atom 이미지 지원 / 콜백이 provider 메타에서 `avatar_url` 매 로그인 백필(닉네임 미덮어씀) / 프로필 페이지도 avatar_url 배선. web typecheck+lint+build 통과. (commit 9760dd2)

## 이번에 완료 (uiux 패스 Top 5)
- [x] **uiux-reviewer 정식 패스** — 19건(High3/Med8/Low8) 지적 수령, Top 5 수정 완료. designer(토큰)+web-dev(앱) 분담, web typecheck+lint+build 통과.
  - designer: `@maps/tokens`에 `coverGradients`/`coverTints` 추가(하드코딩 3중복 제거 소스) + DESIGN.md 커버/Pretendard 방침. (commit baef0be)
  - web-dev: warm cream 배경 실제 적용(`background` 토큰 tailwind 배선 — 그동안 `bg-background`가 무효였음) + Pretendard 실제 로드(jsDelivr @import) + 커버 토큰 소비. (commit) / 아바타 이미지 실패 시 이니셜 폴백(client `AvatarImage`) + 헤더 아바타→`/profile` 링크(PC 로그아웃 경로) + 파일 input `sr-only`(키보드 접근) + 공개 피드 카드 비링크(공개 상세 페이지 부재) + `/explore` 로그아웃 시 `PublicShell`. (commit)

## 이번에 완료 (DB 라이브 적용 + uiux Med/Low)
- [x] **0005 + 0006 라이브 적용 완료 (dba)** — `SBP_TOKEN`(apps/api/.env)으로 mgmt-apply, 둘 다 201 OK. **검증**: anon→`explore_logs`/`explore_log_places` 200, anon→`date_logs` 직결 **401 차단**(0004 memo 갭 해소 확인) / `public-covers` 버킷 존재·public=true·storage 정책 2개·`public_cover_path` 컬럼 public+test 존재. **explore 2단계·아바타·warm 배경이 실제로 켜짐.**
- [x] **uiux 잔여(Med/Low) 일괄 (web-dev)** — h1 계층(#11)·폼 라벨(#10)·지도/검색 로딩·빈상태(#9)·경로선/BottomNav 토큰화(#12·#13)·Button 변형+폼버튼 흡수(#14)·Avatar size/name/aria(#15)·캘린더 빈날 비인터랙티브+오늘 표시(#16)·커버칩 대비(#17)·`BackLink`로 상세 뒤로가기(#18)·로그인 fg 토큰화(#19). web typecheck+lint+build 통과.

## 다음 (Next)   ← 여기부터
2. [ ] **커플 연결 실테스트(두 계정)** — 코드(아바타 포함)는 완료. 남은 건 **사용자가 2계정으로 실제 검증**: A가 초대코드 생성 → B가 `/couple/connect`에서 입력 → 양쪽 헤더에 서로 아바타 표시 / status=connected / 커플 스코프 기록 공유 확인.
3. [ ] ⚠️ **[보안 백로그] `/logs/[id]` memo 노출** — 0006의 public-select 정책이 `to authenticated`(커플 스코프 아님)라, **로그인 유저가 남의 공개 로그 상세를 직결 조회 시 memo까지 노출** 가능. 근본수정: 공개 상세는 anon-safe 뷰 기반 전용 페이지로 分離 or 상세 페이지에서 비소유 공개로그는 memo 등 사적 필드 프로젝션 제외. (현재는 explore 카드 비링크로 회피 중)
4. [ ] **AdSense 도입** — 공개 표면 완료(1·2단계 라이브)로 선행조건 충족. ads.txt/스크립트/AdUnit(공개 페이지) + 신청(사용자). `docs/plan/03-adsense.md`.
5. [ ] **app-dev: 모바일 앱(Expo) 동일 흐름** (로그인→커플→피드→상세→사진) — 웹 안정 후 큰 작업.
6. [ ] (나중) api Kakao 장소검색 프록시 (서버리스는 배포됨, map-api.weourus.xyz).

## 막힘 (Blocked) — 사용자 승인/대시보드 필요
- [ ] **api CORS_ORIGINS prod 반영** — `.env.example`/로컬 `.env`엔 `https://maps.weourus.xyz` 추가됨. Vercel production 값은 라이브 변경이라 auto-mode 차단 → 사용자가 `vercel env`로 반영 (현재 웹은 Supabase 직접 호출이라 당장 blocking 아님).
- [ ] **SSO 동의화면 앱명 We Log로** — Kakao Developers 콘솔 앱 이름/아이콘, Google Cloud OAuth 동의화면 App name을 "We Log"로. (코드 아님 — 로그인 시 사용자에게 보이는 이름)

## 세팅 메모
- 지도: Kakao Map. web `NEXT_PUBLIC_KAKAO_MAP_KEY`, mobile `EXPO_PUBLIC_KAKAO_MAP_KEY` 채워짐. api `KAKAO_REST_API_KEY`는 미정(장소검색 프록시 시 필요).
- ⚠️ 보안: service_role/secret/DB비번이 초기 대화로 노출됨 → Supabase 대시보드에서 rotate 권장(SETUP.md "Key rotation").
- ⚠️ `SBP_TOKEN`(Supabase 개인 액세스 토큰)이 `apps/api/.env`에 추가됨(0005/0006 적용용). gitignore돼 커밋 안 되지만 **일회성이므로 대시보드에서 revoke 권장**. mgmt-apply/mgmt-query가 이 값을 사용.
