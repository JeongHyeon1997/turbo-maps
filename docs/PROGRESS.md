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
- (없음)

## 다음 (Next)   ← 여기부터
- [ ] planner: MVP 확정 — 소셜로그인 **적극 사용**(Kakao 우선 + Google/Apple), 사진=Supabase Storage, 커플연결=초대코드 — (plan: docs/plan/00-mvp.md)
- [ ] designer: DESIGN.md 확정 + 다크 토큰 + Atomic 컴포넌트 스펙 (반응형 브레이크포인트 규칙 포함)
- [ ] db-dev: 0001 마이그레이션 (profiles/couples/places/date_logs/date_log_places/routes) + RLS + test 스키마 — SCHEMA.md 갱신
- [ ] dba: 위 마이그레이션 라이브 적용 + 인덱스/Storage 버킷/RLS 성능
- [ ] schema-dev: @maps/shared 스키마 (couple/place/dateLog/route)
- [ ] server-dev: couples/places/date-logs 엔드포인트
- [ ] web-dev / app-dev: 소셜로그인 → 커플연결 → 피드(실데이터) → 지도(경로) 화면
- [ ] build-qa: 각 단계 후 typecheck/lint/build 게이트

## 막힘 (Blocked)
- (없음)

## 세팅 메모
- 지도: Kakao Map. web `NEXT_PUBLIC_KAKAO_MAP_KEY`, mobile `EXPO_PUBLIC_KAKAO_MAP_KEY` 채워짐. api `KAKAO_REST_API_KEY`는 미정(장소검색 프록시 시 필요).
- ⚠️ 보안: service_role/secret/DB비번이 초기 대화로 노출됨 → Supabase 대시보드에서 rotate 권장(SETUP.md "Key rotation").
