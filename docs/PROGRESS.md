# PROGRESS — 2026-07-05 기준

> 새 세션은 이 파일을 먼저 읽는다. `## 다음` 맨 위 항목부터 집어든다.
> 형식 규칙은 `docs/README.md`.

## 완료 (Done)
- [x] 모노레포 스캐폴딩 (Bun+Turborepo, apps/web·api·mobile, packages/shared·tokens) — morun 구조 복제 후 커플 도메인으로 정리
- [x] Supabase 연결 배선 (project `giilijttitajvygdosbe`) + `.env` (gitignore) + Kakao JS 키
- [x] 워밍한 디자인 방향 초안 (`DESIGN.md`) + 토큰 warm 팔레트 반영
- [x] 9개 역할 에이전트 (`.claude/agents/`)
- [x] docs 이어가기 프로토콜 정립 (`docs/README.md`)

## 진행중 (Doing)
- (없음 — 스캐폴딩 완료 상태)

## 다음 (Next)   ← 여기부터
- [ ] planner: MVP 범위 확정 + 데이터모델 상세화 — (plan: docs/plan/00-mvp.md)
- [ ] db-dev: 0001 마이그레이션 (profiles/couples/places/date_logs/date_log_places/routes) + RLS + test 스키마 — SCHEMA.md 갱신
- [ ] schema-dev: @maps/shared 스키마 (couple/place/dateLog/route)
- [ ] designer: DESIGN.md 확정 + 다크 토큰 + Atomic 컴포넌트 스펙
- [ ] server-dev: couples/places/date-logs 엔드포인트
- [ ] web-dev / app-dev: 인증 + 피드 + 지도(경로) 화면
- [ ] build-qa: 각 단계 후 typecheck/lint/build 게이트

## 막힘 (Blocked)
- (없음)

## 세팅 메모
- 지도: Kakao Map. web `NEXT_PUBLIC_KAKAO_MAP_KEY`, mobile `EXPO_PUBLIC_KAKAO_MAP_KEY` 채워짐. api `KAKAO_REST_API_KEY`는 미정(장소검색 프록시 시 필요).
- ⚠️ 보안: service_role/secret/DB비번이 초기 대화로 노출됨 → Supabase 대시보드에서 rotate 권장(SETUP.md "Key rotation").
