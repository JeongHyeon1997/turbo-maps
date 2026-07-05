---
status: todo
last-updated: 2026-07-05
owner: planner
---

# 캘린더 · 전체지도 · 퍼블릭 공간

## 1. 캘린더 (`/calendar`)
- 월 달력에 기록 있는 날 표시(점/썸네일) → 날짜 클릭 시 그날 기록으로.
- 데이터: 기존 `date_logs.date`만으로 가능. **스키마 변경 없음.**
- 담당: web-dev (Calendar organism) · designer(셀 디자인).

## 2. 전체 지도 (`/map`)
- 커플의 **모든 방문지**를 한 지도에 마커로. (원하면 카테고리 색상/클러스터.)
- 데이터: `date_log_places → places` 전부 조회. **스키마 변경 없음.** `KakaoMap` 재사용(경로 라인은 끄고 마커만, 또는 로그별 색).
- 담당: web-dev.

## 3. 퍼블릭 공간 (공개 기록/탐색) ⭐ 큰 작업
사적인 커플 기록 외에, **공개로 공유**해 다른 커플이 맛집/코스를 발견하는 공간.

- **스키마(0004)**: `date_logs.visibility text default 'private' check (private|public)`.
- **RLS 추가**: `visibility='public'`인 date_logs/그에 연결된 date_log_places/routes/places를 **누구나 select** 허용(익명 포함 or 인증만). 기존 커플-스코프 정책은 유지하고 **공개 읽기 정책을 OR로 추가**.
- **화면**: `/explore` 공개 피드(최신/인기), 공개 상세(작성자 닉네임/아바타만 노출, 개인 메모는 숨김 옵션).
- **작성 흐름**: 기록 작성/수정 시 공개/비공개 토글.
- **프라이버시 주의**: 공개 시 정확한 집 위치 등 민감 정보 노출 위험 → 공개 기록은 장소/평점/사진 위주, 개인 메모는 비공개 유지 옵션.
- 담당: db-dev/dba(0004+RLS) · schema-dev(visibility) · web-dev(explore/토글) · uiux-reviewer(프라이버시 표기).

## 추천 순서
1. **전체지도** (가장 빠름, KakaoMap 재사용, 스키마 무관)
2. **캘린더** (중간, 스키마 무관)
3. **퍼블릭 공간** (큼, 0004 + RLS + explore + 프라이버시 설계)
