# PROGRESS — 2026-07-07 기준

> 새 세션은 이 파일을 먼저 읽는다. `## 다음` 맨 위 항목부터 집어든다.
> 형식 규칙은 `docs/README.md`. 상세 이력은 각 `docs/plan/*` 참고.

## 다음 (Next)   ← 새 세션은 여기부터, 위에서 아래로
1. [ ] **STEP 0 — 실공개 로그 확보 (사용자 작업, 최우선 선행)** — 공개 뷰가 현재 전부 `[]`(공개 로그 0건).
       커플 실테스트를 겸해 **공개 데이트 코스 8~15건 작성**(공개 토글 ON + 커버 사진 + 장소/평점). `/explore`·`/places`를 빈 화면이 아니게 만든다. → `docs/plan/03-adsense.md` STEP 0. **이게 AdSense·지역탐색·심사의 사실상 공통 선행조건.**
2. [ ] **AdSense 도입 (STEP 1 코드/페이지)** — STEP 0로 실데이터가 쌓이면 착수. ads.txt·AdSense 스크립트(공개 레이아웃 한정)·AdUnit(공개 페이지만)·CMP. 신청은 사용자. **로그인 후 사적 화면엔 광고 금지.** → `docs/plan/03-adsense.md` STEP 1~2. 담당 web-dev.
3. [ ] **(Phase 2-C) 지역 탐색** — `/explore/지역/[region]` 등. 지역 = `places.address` **주소 파싱 동/구**(결정됨). 공개 실데이터 쌓인 뒤. → `docs/plan/05-public-enrichment.md` C. 담당 db-dev+web-dev.
4. [ ] **(Phase 3) 큐레이션·좋아요·코스 따라하기** — → `docs/plan/05-public-enrichment.md` Phase 3.
5. [ ] **app-dev: 모바일 앱(Expo) 동일 흐름** (로그인→커플→피드→상세→사진) — 웹 안정 후 큰 작업.
6. [ ] (나중) api Kakao 장소검색 프록시 (서버리스는 배포됨, map-api.weourus.xyz).

## 진행중 (Doing)
- (없음 — 세션 종료 시점 클린. 다음 세션은 위 `## 다음` 1번부터.)

## 막힘 (Blocked) — 사용자 승인/대시보드 필요
- [ ] **커플 연결 실테스트(두 계정)** — 코드(아바타 포함) 완료. 사용자가 2계정으로 실검증: A 초대코드 생성 → B `/couple/connect` 입력 → 양쪽 헤더 아바타/status=connected/커플 스코프 공유 확인. (※ `## 다음` STEP 0와 겸해서 진행 가능)
- [ ] **api CORS_ORIGINS prod 반영** — `.env.example`/로컬엔 `https://maps.weourus.xyz` 추가됨. Vercel production 값은 사용자가 `vercel env`로 반영. (웹은 Supabase 직접 호출이라 당장 blocking 아님)
- [ ] **SSO 동의화면 앱명 We Log로** — Kakao Developers / Google Cloud OAuth 동의화면 App name·아이콘을 "We Log"로. (코드 아님)

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

## 세팅 메모
- 지도: Kakao Map. web `NEXT_PUBLIC_KAKAO_MAP_KEY`·mobile `EXPO_PUBLIC_KAKAO_MAP_KEY` 채움. api `KAKAO_REST_API_KEY` 미정(장소검색 프록시 시).
- ⚠️ 보안: service_role/secret/DB비번이 초기 대화로 노출 → 대시보드 rotate 권장(SETUP.md "Key rotation").
- ⚠️ `SBP_TOKEN`(Supabase PAT)이 `apps/api/.env`에 있음(마이그레이션 적용용, gitignore). 일회성이므로 대시보드 revoke 권장. mgmt-apply/mgmt-query가 사용.
