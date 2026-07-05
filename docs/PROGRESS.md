# PROGRESS — 2026-07-05 기준

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

## 다음 (Next)   ← 여기부터
- [ ] Kakao 플랫폼 → Web 사이트 도메인에 `https://maps.weourus.xyz` 추가 (프로덕션 지도용; 로컬은 localhost:3000)
- [ ] 기록 상세 페이지 `/logs/[id]` (지도 + 장소 + 메모)
- [ ] 사진 업로드 (Supabase Storage `date-photos` 버킷 연동)
- [ ] 커플 연결 실테스트(두 계정) + 파트너 아바타 실제 표시
- [ ] app-dev: 모바일 동일 흐름
- [ ] (나중) api 서버리스 + Kakao 장소검색 프록시 + map-api.weourus.xyz

## 막힘 (Blocked)
- [ ] **0001 라이브 적용** — 자동 적용이 프로덕션 DB 쓰기라 auto-mode에서 차단됨. 해결: 사용자가 승인해 CLI로 적용하거나, Supabase SQL Editor에 `supabase/migrations/0001_init.sql` 붙여넣기.
- [ ] **Kakao 로그인 실동작** — Supabase 대시보드 Auth → Providers → Kakao 활성화 필요. **Kakao REST API 키 + Client Secret** 필요(지금 받은 건 JavaScript 키). Redirect: `https://giilijttitajvygdosbe.supabase.co/auth/v1/callback` 를 Kakao 앱에 등록.

## 막힘 (Blocked)
- (없음)

## 세팅 메모
- 지도: Kakao Map. web `NEXT_PUBLIC_KAKAO_MAP_KEY`, mobile `EXPO_PUBLIC_KAKAO_MAP_KEY` 채워짐. api `KAKAO_REST_API_KEY`는 미정(장소검색 프록시 시 필요).
- ⚠️ 보안: service_role/secret/DB비번이 초기 대화로 노출됨 → Supabase 대시보드에서 rotate 권장(SETUP.md "Key rotation").
