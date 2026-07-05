---
status: doing
last-updated: 2026-07-06
owner: planner
---

# 내정보(프로필) + 모바일 하단 네비게이션

## 배경
- 웹 헤더 상단 내비는 데스크톱 전용(`md:flex`)이라 **모바일엔 이동 수단이 없다** → 하단 탭바 필요.
- **내정보** 화면이 없다 → 프로필/커플/로그아웃 진입점 필요.

## 1. 모바일 하단 네비게이션 (BottomNav)
- organism `BottomNav` — 모바일에서만(`md:hidden`) 화면 하단 고정.
- 탭: 홈 `/` · 지도 `/map` · 기록 `/logs/new`(가운데 강조) · 탐색 `/explore` · 내정보 `/profile`.
- 활성 탭 강조(현재 경로). AppShell에 삽입, 본문 하단 패딩 확보.
- 담당: web-dev + designer(아이콘/강조), 추후 app-dev(모바일 앱 동일 패턴).

## 2. 내정보 `/profile`
- 표시: 아바타/닉네임, 커플 상태(연결됨/대기중+초대코드), 내 기록 수.
- 액션: 닉네임 수정, (미연결 시) 커플 연결하기 링크, **로그아웃**.
- 데이터: `profiles`(본인), `couples`(상태/초대코드), `date_logs` count. 스키마 변경 없음.
- 로그아웃: `supabase.auth.signOut()` (client action) → `/login`.
- 담당: web-dev + schema-dev(이미 profile 스키마 존재).

## 완료 기준
- 모바일에서 하단바로 전 화면 이동 가능, 활성 탭 표시.
- `/profile`에서 닉네임 수정·로그아웃·커플상태 확인 가능.

## 역할 운용
- planner(이 문서) → web-dev 구현 → **build-qa**(typecheck/lint/build 게이트) → **uiux-reviewer**(반응형/접근성/일관성 점검) → 배포.
