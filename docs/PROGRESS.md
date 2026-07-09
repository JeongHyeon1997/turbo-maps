# PROGRESS — 2026-07-07 기준

> 새 세션은 이 파일을 먼저 읽는다. `## 다음` 맨 위 항목부터 집어든다.
> 형식 규칙은 `docs/README.md`. 상세 이력은 각 `docs/plan/*` 참고.

## 다음 (Next)   ← 새 세션은 여기부터, 위에서 아래로
1. [ ] **STEP 0 — 실공개 로그 확보 (사용자 작업, 최우선 선행)** — 공개 뷰가 현재 전부 `[]`(공개 로그 0건).
       커플 실테스트를 겸해 **공개 데이트 코스 8~15건 작성**(공개 토글 ON + 커버 사진 + 장소/평점). `/explore`·`/places`·`/explore/regions`를 빈 화면이 아니게 만든다. → `docs/plan/03-adsense.md` STEP 0. **이게 AdSense·지역탐색·심사의 사실상 공통 선행조건.** (데이터 무관한 아래 2·3은 지금 병행 가능.)
2. [~] **색감·테마 전환 (웜 뉴트럴 미니멀리즘, 토스풍) — A 완료 / ★ 다음 세션 여기부터 (web-dev B)** — 확정(사용자 승인): 웜 오프화이트+흰 카드, 웜뉴트럴 그레이, 블루 `#1E7CF8` 단일 인터랙션색, coral=rating 전용, 무지개 축소, 다크(뉴트럴 차콜 `#4B9BFF`).
   - [x] **A. designer 토큰 (커밋 `e601a95`)** — `css-vars.ts`로 `--color-*` rgb 채널 발행 + tailwind `rgb(var()/<alpha>)` 소비(클래스명·투명도 보존), `colors.ts` 웜뉴트럴 라이트 + `colorsDark` 차콜, base plugin이 `:root`/`.dark` 주입, `fonts.ts` 주아 로고폰트(Logo만 `font-jua`), typography/spacing 정리, DESIGN.md 갱신. mobile은 hex 상수 계속 소비.
   - [ ] **B. web-dev 컴포넌트/토글 ← 다음 세션 착수** — ⚠️ **아직 없음**: `ThemeProvider` + **3-way(system/light/dark) `ThemeToggle`**(html에 `.dark` 토글 + localStorage + FOUC 방지 인라인 스크립트) — 이게 있어야 다크가 런타임 전환됨(현재 라이트 `:root`만 활성). Button `size`(lg/md/sm)+press/focus링, `TextField` atom(logs/new 반복 흡수), `CoverFallback`(무지개 그라데이션 교체), 모션 베이스라인(`duration-200 ease-out`+`active:scale`), 여백. 07 헤더/푸터와 연계.
   - [ ] **C. uiux-reviewer + build-qa** — 라이트/다크 대비·면분리·모션·CSS변수 시각회귀·토글 스모크.
   - 스펙·리스크5건: `docs/plan/08-theme-tokens.md`(A1~A8/B1~B7), `DESIGN.md`. 폰트: 한나/꾸불림은 `apps/web/src/fonts/`에 보관·미배선(woff2 변환 최적화 TODO). 담당 web-dev+designer, uiux+build-qa.
3. [ ] **헤더 & 푸터 — `SiteHeader` 통합 + 전역 푸터 + ThemeToggle** (2의 B와 연계) — 결정됨: 로그아웃/로그인 상태별 nav 분기, 공개 탐색(`/explore`·`/places`·지역)·커뮤니티 진입점 자리, 정책/소개 링크 푸터, 헤더에 3-way ThemeToggle 배치. 헤더 organism 중복 통합. **주의: `PublicShell`에 `<AdSenseScript/>`가 마운트돼 있으니 헤더 리팩터 시 유지할 것.** → `docs/plan/07-header-footer.md`. 담당 web-dev+designer+uiux-reviewer.
4. [ ] **AdSense STEP 1 잔여** — 로더(`src/lib/adsense.tsx`, PublicShell 마운트)·`ads.txt`(pub `ca-pub-5362531643629275`)·env는 **완료**. 남은 것: **AdUnit 컴포넌트(승인 후 slot id 필요)·공개 페이지 배치·CMP/Consent Mode v2**. 실제 광고 노출은 STEP0 실데이터 + STEP2 승인 후. **Vercel env `NEXT_PUBLIC_ADSENSE_CLIENT` 설정은 Blocked 참고.** → `docs/plan/03-adsense.md`. 담당 web-dev.
5. [ ] **커뮤니티 공간 (C-1: 좋아요·북마크부터)** — 커플 스코프 넘어 전체 유저 장소/코스 참여·발견. 결정됨: **지금은 헤더 IA에 진입점 자리만, 기능은 STEP0 실데이터 후.** C-1(좋아요·북마크·인기정렬, 익명 유지 가능)→C-2(따라하기)→C-3(정체성, **작성자 익명화 0007과 충돌 → ADR 선행**). → `docs/plan/06-community.md`. 담당 db-dev+web-dev+server-dev.
6. [ ] **app-dev: 모바일 앱(Expo) 동일 흐름** (로그인→커플→피드→상세→사진) — 웹 안정 후 큰 작업.
7. [ ] (나중) api Kakao 장소검색 프록시 (서버리스는 배포됨, map-api.weourus.xyz).

## 진행중 (Doing)
- **세션 종료(사용자 컴퓨터 오프) — 작업 트리 클린, 전부 커밋·푸시됨.**
- **다음 세션 시작점: `## 다음` 2번 B — 토스풍 테마의 web-dev 컴포넌트/토글.** designer A(토큰 CSS변수+웜뉴트럴/차콜 다크+주아 폰트)는 커밋 `e601a95`로 **완료**. 다음: `ThemeProvider`+**3-way ThemeToggle**(html `.dark` 토글·localStorage·FOUC 방지 — 이게 있어야 다크 실제 전환됨), Button size, TextField atom, CoverFallback, 모션 베이스라인 → 07 헤더/푸터 연계.
- 처음에 `docs/plan/08-theme-tokens.md`(B1~B7) + `DESIGN.md` 읽고 B부터. 검증은 라이트/다크 토글 스모크 필수.

## 막힘 (Blocked) — 사용자 승인/대시보드 필요
- [ ] **커플 연결 실테스트(두 계정)** — 코드(아바타 포함) 완료. 사용자가 2계정으로 실검증: A 초대코드 생성 → B `/couple/connect` 입력 → 양쪽 헤더 아바타/status=connected/커플 스코프 공유 확인. (※ `## 다음` STEP 0와 겸해서 진행 가능)
- [ ] **api CORS_ORIGINS prod 반영** — `.env.example`/로컬엔 `https://maps.weourus.xyz` 추가됨. Vercel production 값은 사용자가 `vercel env`로 반영. (웹은 Supabase 직접 호출이라 당장 blocking 아님)
- [ ] **SSO 동의화면 앱명 위로그로** — Kakao Developers / Google Cloud OAuth 동의화면 App name·아이콘을 "위로그"로. (코드 아님)
- [ ] **0009 라이브 적용 대기** — `0009_explore_regions`(explore_places.region + explore_regions 뷰) 파일 작성·검증 완료, **프로덕션 DB 적용은 자동 승인 거부**됨(사용자 권한 필요). 공개 로그 0건이라 급하지 않음 — STEP0 실데이터 넣을 때 dba로 함께 적용 권장. 그전까진 웹 지역 페처가 `[]`로 degrade.
- [ ] **Vercel env `NEXT_PUBLIC_ADSENSE_CLIENT`** — 코드/`.env.example`엔 `ca-pub-5362531643629275` 반영됨. AdSense 로더가 프로덕션에서 실제 로드되려면 사용자가 Vercel `maps-web` 프로젝트 env에 이 값을 설정해야 함(미설정 시 graceful 미로드).
- [ ] **카카오 OG 캐시 초기화** — 공개 상세 OG(og-default/커버) 반영 후, 이미 공유된 URL은 카카오가 캐시하므로 https://developers.kakao.com/tool/debugger/sharing 에서 초기화해야 새 썸네일이 뜸.

## 완료 (Done)

### 기반 (세팅·배포)
- [x] 모노레포 스캐폴딩 (Bun+Turborepo, apps/web·api·mobile, packages/shared·tokens), morun 복제→커플 도메인 정리
- [x] Supabase 연결(project `giilijttitajvygdosbe`) + `.env` + Kakao 키 / warm 디자인 방향(`DESIGN.md`)+토큰 / 10개 역할 에이전트 / docs 이어가기 프로토콜(`docs/README.md`)
- [x] Vercel 연결 + env: `maps-web`(→`maps.weourus.xyz` 라이브) · `maps-api` 서버리스(`map-api.weourus.xyz/api/health` 200, `/health/db` ok). 스크립트 `scripts/{sync,pull}-env-*.sh`

### 인증 + 커플 수직 슬라이스 (완료)
- [x] DB `0001_init`(profiles/couples + 초대코드 join_couple + RLS, public/test) + `@maps/shared` profile/couple Zod
- [x] 소셜로그인 `/login`(Kakao/Google) + `/auth/callback`(세션교환·프로필 upsert·avatar_url 백필) + 세션 미들웨어(중앙 라우트 가드) + `/couple/connect`(초대코드 생성/입력). Kakao 실동작·prod localhost 리다이렉트 버그 수정(`scripts/set-auth-urls.ts`)
- [x] 헤더 파트너 아바타 실표시(AppShell async 조회·Avatar 이미지·이니셜 폴백). (실테스트만 Blocked 참고)

### 기록 코어 (place·date-log·route·사진)
- [x] DB `0002`(places/date_logs/date_log_places/routes + date-photos 버킷) + 공유 스키마
- [x] 홈 피드(반응형) / `/map` 전체지도 / `/calendar` / `/logs/new` 작성(공개 토글·다중 사진) / `/logs/[id]` 상세(장소·평점·메모·경로/마커·갤러리)
- [x] 대표 사진 썸네일(`0003`) / 사진 갤러리 기록당 다장(`0005` + `dateLogPhotoSchema`) / `BottomNav` 모바일 네비 / `/profile`(닉네임·커플상태·로그아웃)
- [x] 브랜드 "We Log" rebrand(메타데이터/OG/로그인/헤더) + 인증 UX 보강(에러표시·OAuth 실패 복구·`?next=` 복귀)

### 공개 표면 (AdSense·SEO 기반)
- [x] **Phase 1 — 랜딩/정책**: 공개 랜딩 `/`(세션 분기) + `/privacy` + `/terms`(쿠키·제3자 광고 고지). 미들웨어 public 배선. → `docs/plan/04-public-surface.md`
- [x] **Phase 2 — explore 공개화 + copy-on-publish**: `/explore`를 anon-safe 뷰(`explore_logs`/`explore_log_places`) 기반으로. 공개 커버는 `public-covers` 무토큰 URL, 작성 시 best-effort 복사. (`0006`)
- [x] **Phase 1 A+E — 공개 코스 상세 + SEO**: `/explore/[id]`(anon-safe·작성자 익명·경로선 비공개 마커만·memo/갤러리 비노출) + explore/랜딩 카드 링크 + `sitemap.ts`/`robots.ts`/per-log OG/JSON-LD. `0007`
- [x] **보안(`0007`)**: base 테이블 `to authenticated` 공개 select 정책 제거 + `explore_logs` 익명화 → **anon+authenticated 모두 남의 공개로그 memo 직결 조회 차단(기존 memo 노출 백로그 완전 폐쇄)**
- [x] **Phase 2-B — place 축**: `/places/[id]`(장소 상세·단일 마커·평균평점·공개 코스·Place JSON-LD+aggregateRating) + `/places` 카테고리 디렉터리(FilterChip·PlaceCard) + 코스↔장소 내부링크. 집계 뷰 `explore_places`/`explore_place_logs`(`0008`)
- [x] **uiux-reviewer 정식 패스(19건)** — Top5 + Med/Low 전건 반영. warm cream 배경 실적용·Pretendard 로드·커버 토큰(`coverGradients`/`coverTints`)·접근성(라벨/aria/키보드)·Button 변형·BackLink 등. designer+web-dev 분담
- [x] **DB 0005–0008 전부 라이브 적용 + 검증(dba)** — anon→공개 뷰 200, anon+auth→base 직결 401/차단, `public-covers` 버킷·정책·컬럼 확인. **SCHEMA.md 라이브 현행화 완료.**
- [x] **Phase 2-C — 지역 탐색**: `explore_places.region`(주소 파싱 **구/시·군**, `derive_region()`) + 신규 `explore_regions` 집계 뷰(`0009`, public/test·SCHEMA.md). 웹 `/explore/regions`(지역 인덱스·RegionCard) + `/explore/regions/[region]`(지역별 장소·PlaceCard·CollectionPage JSON-LD) + place 상세→지역 링크 + sitemap 확장. **한글 정적 세그먼트 404 버그** → ASCII 슬러그(`/explore/regions`)로 해결(동적 `[region]`엔 한글값 유지). `bun run build`+`next start` 스모크 200 검증. **`0009` 라이브 적용은 Blocked(사용자 권한) 참고.**
- [x] **SEO 배선 수정**: `/sitemap.xml`·`/robots.txt`가 미들웨어 로그인 리다이렉트로 막히던 것 → `EXACT_PUBLIC`에 추가(크롤러 200 확인).
- [x] **브랜드 로고·파비콘**: `public/logo.png`(위로그 워드마크) + `app/icon.png`·`apple-icon.png`(Next 자동 파비콘 배선).
- [x] **표기 위로그 rebrand**: web 사용자 표기 "We Log" → "위로그" 전수 교체(메타데이터/OG/JSON-LD/정책/로그인/Logo·푸터·랜딩). 로고 워드마크는 영문 유지(영/한 병행).

### 디자인 방향 전환 + 인프라 (이번 세션)
- [x] **theme.ts 배선 통합 + warm 톤 리프레시(1차)** — morun 잔재 청산, 커플앱 시맨틱 단일 레이어, tailwind가 `theme.color.*` 소비. **(주의: 다음 세션 토스풍 전환에서 웜뉴트럴+CSS변수+다크로 다시 리팩터됨.)**
- [x] **토스풍 방향 확정 문서화** — uiux-reviewer 진단 + 사용자 결정(웜뉴트럴 미니멀·감성색 절제·주아 로고한정·다크 3-way 토글)을 `DESIGN.md`·`docs/plan/08`로 통합. **실행(토큰/컴포넌트)은 미착수 — 다음 세션.**
- [x] **모바일 지도 드래그 버그 수정** — `KakaoMap` 재init 시 이전 지도 레이어 미파괴로 터치 가로챔 → innerHTML 클리어 + draggable/zoomable 명시 + `/logs/new` markers useMemo. **실기기 터치 확인은 사용자 몫.**
- [x] **공개 상세 OG 썸네일 SSR(카톡 공유)** — `lib/og-image.ts` 헬퍼(커버 우선/`og-default.png` 800×400 폴백), layout·explore/[id]·places/[id]·regions/[region] og:image + twitter large image. 800×400 브랜드 OG `public/og-default.png`. (카카오 캐시 초기화 Blocked 참고.)
- [x] **브랜드 로고·파비콘** — `public/logo.png` + `app/icon.png`·`apple-icon.png`(위 공개표면 항목과 별개 커밋).
- [x] **배민 폰트 self-host** — 한나(Air/Pro/11yrs)·주아·꾸불림 `apps/web/src/fonts/`에 배치(을지로/연성/기랑해랑/도현 삭제). 루트 `BM-fonts-package`는 gitignore. **배선(주아→Logo)은 다음 세션 designer A.**
- [x] **AdSense STEP1 로더 준비** — `src/lib/adsense.tsx`(PublicShell 전용, env-gated) + `public/ads.txt`(pub `ca-pub-5362531643629275`) + `.env.example`. AdUnit/CMP/Vercel-env는 잔여(다음 참고).

## 세팅 메모
- 지도: Kakao Map. web `NEXT_PUBLIC_KAKAO_MAP_KEY`·mobile `EXPO_PUBLIC_KAKAO_MAP_KEY` 채움. api `KAKAO_REST_API_KEY` 미정(장소검색 프록시 시).
- ⚠️ 보안: service_role/secret/DB비번이 초기 대화로 노출 → 대시보드 rotate 권장(SETUP.md "Key rotation").
- ⚠️ `SBP_TOKEN`(Supabase PAT)이 `apps/api/.env`에 있음(마이그레이션 적용용, gitignore). 일회성이므로 대시보드 revoke 권장. mgmt-apply/mgmt-query가 사용.
