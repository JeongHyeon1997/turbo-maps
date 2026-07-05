---
status: todo
last-updated: 2026-07-05
owner: planner
---

# MVP 계획 (초안 — planner가 확정)

> 이 문서는 시작점 스케치다. `planner` 역할이 사용자와 범위를 좁히고 확정한다.

## 목표
커플이 **하루 데이트를 기록**한다: 방문한 장소들 + 이동 경로 + 사진/메모/평점. 나중에 지도와 타임라인으로 함께 되돌아본다.

## 사용자 스토리 (초안)
- 회원가입/로그인 후 **파트너와 커플 연결**(초대 코드).
- 새 **데이트 기록** 작성: 날짜 + 방문 장소 여러 개(Kakao 검색) + 각 장소 평점/메모 + 사진.
- 그날의 **경로**를 지도에 표시(방문 순서 라인).
- **피드/타임라인**에서 지난 기록을 카드로 열람.

## 데이터모델 (초안 — db-dev/schema-dev가 확정)
- `profiles` (auth.users 1:1: nickname, avatar)
- `couples` (partner_a, partner_b, 연결일) + 초대 코드
- `places` (kakao_place_id, name, category, lat, lng, address)
- `date_logs` (couple_id, date, title, memo)
- `date_log_places` (date_log_id, place_id, order, rating, memo)
- `routes` (date_log_id, coordinates jsonb)
- RLS: 커플의 두 파트너만 자신들의 date_logs/routes 접근.

## 화면 (초안)
- (auth) 로그인/회원가입 · 커플 연결
- 피드/타임라인 · 기록 상세(지도+장소+사진) · 기록 작성(에디터) · 프로필

## API (초안)
- couples: 생성/연결(초대코드) · 조회
- places: Kakao 검색 프록시 · upsert
- date-logs: CRUD (+ places/route 포함)

## 작업 분해 (역할)
1. designer — DESIGN.md 확정 + Atomic 스펙
2. db-dev — 0001 마이그레이션 + RLS + test
3. schema-dev — @maps/shared 스키마
4. server-dev — couples/places/date-logs 엔드포인트
5. web-dev / app-dev — auth → 커플연결 → 피드 → 기록작성 → 지도
6. build-qa — 단계별 게이트

## 완료 기준 (MVP)
로그인 → 커플 연결 → 데이트 기록 1건 작성(장소+경로+사진) → 피드에서 열람이 web/mobile 양쪽에서 동작.

## 미결 (planner가 사용자 확인)
- 사진 저장: Supabase Storage 사용?
- 소셜 로그인(Kakao) 포함 여부 (memory: minimal signup 선호).
- 커플 연결 방식: 초대코드 vs 링크.
