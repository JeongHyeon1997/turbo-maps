---
status: todo
last-updated: 2026-07-09
owner: planner
---

# 헤더 & 푸터 — 생성·정리 및 정보구조

> 연관: `06-community.md`(탐색/커뮤니티 진입점 배선), `08-theme-tokens.md`(비주얼은 새 테마 위에서), `DESIGN.md`(warm/personal).
> 목적: 로그인/로그아웃 상태별 **헤더·푸터의 정보구조(IA)를 정의**하고, atomic 계층(atoms→molecules→organisms→templates)으로 정리한다. 특히 **로그아웃 방문자의 탐색 진입점 부재**와 **로그인 화면의 푸터 부재**를 해결.

## 현황 진단 (2026-07-09)

### 셸 2종
- **AppShell**(로그인): `AppHeader`(sticky, `Logo` + 데스크톱 nav[홈/지도/캘린더/탐색] + 아바타/로그인CTA) + 콘텐츠 + `BottomNav`(모바일). **푸터 없음.**
- **PublicShell**(로그아웃 — `/`·`/privacy`·`/terms`, 그리고 공개 explore/places도 로그아웃 시 이걸 탐): `LandingHeader`(`Logo` + 로그인 버튼만, **nav 없음**) + 콘텐츠 + `SiteFooter`(Logo·저작권·개인정보/이용약관).

### 문제점
1. **로그아웃 헤더에 탐색 진입점이 없다.** `LandingHeader`는 로고+로그인뿐 → 로그아웃 방문자가 `/explore`·`/places`(공개·크롤 대상)로 **헤더로는 못 간다**. AdSense·SEO·커뮤니티 유입 관점에서 치명적(공개 콘텐츠가 있는데 내비게이션이 없음).
2. **로그인 화면에 푸터가 없다.** 정책 링크(개인정보/이용약관)가 로그인 상태에선 어디에도 없음 → 법적/신뢰 요소 접근 불가. AdSense는 정책 링크의 전역 접근을 선호.
3. **헤더 organism 2개(AppHeader/LandingHeader)가 부분 중복** — 둘 다 sticky+로고+로그인CTA 골격이 같은데 따로 존재. nav 항목·상태 분기만 다름.
4. **소개/회사/문의·커뮤니티 링크 부재** — 푸터에 서비스 소개(About)·문의·커뮤니티 진입이 없음. 신뢰·회유 축 약함.
5. **네비 라벨/구조가 정체성 미반영** — `홈/지도/캘린더/탐색`은 기록 앱 내부 동선 위주. 공개 표면의 "탐색·장소·커뮤니티"가 헤더 IA에 약하게만 반영.

## 목표 정보구조 (IA)

### 헤더 — 상태별
| 영역 | 로그아웃(public) | 로그인(app) |
| --- | --- | --- |
| 좌: 브랜드 | Logo(→`/`) | Logo(→`/` 피드) |
| 중: 주요 네비(데스크톱) | **탐색 / 장소 / 커뮤니티** (공개 발견 동선) | 홈 / 지도 / 캘린더 / 탐색(+커뮤니티) |
| 우: 액션 | **로그인** 버튼 | 아바타(→`/profile`) · (모바일은 BottomNav) |
| 모바일 | 로고+로그인 (+햄버거로 탐색/장소/커뮤니티?) | BottomNav 유지 |

- 로그아웃 헤더에 **공개 탐색 링크(탐색·장소, C 이후 커뮤니티)**를 반드시 노출 → 문제 1·5 해결.
- 커뮤니티(`06`)가 서면 로그인/로그아웃 양쪽 헤더에 **커뮤니티** 진입점 추가.

### 푸터 — 전역(로그인/로그아웃 공통)
- **AppShell에도 푸터를 넣는다**(모바일은 BottomNav와 겹치지 않게 데스크톱/스크롤 하단에만, 또는 slim 버전) → 문제 2 해결.
- 푸터 정보구조(그룹):
  - **브랜드**: Logo + 한 줄 태그라인 + `© 2026 We Log`.
  - **둘러보기**: 탐색 / 장소 / 커뮤니티(06 이후).
  - **서비스**: 소개(About — 신규 `/about`?) / 문의(메일 or 폼).
  - **정책**: 개인정보처리방침 / 이용약관.
- 정책 링크는 로그인 상태에서도 접근 가능해야 함(AdSense/신뢰).

## 방안 후보 (컴포넌트 구조)

### 헤더 리팩터 — 단일 organism으로 통합 (권장)
- `SiteHeader`(organism) 하나로 통합하고 **`variant`/`navItems`/`signedIn`/`avatars` props로 상태 분기**. AppHeader·LandingHeader의 중복 골격(sticky·로고·CTA)을 흡수.
  - molecule로 `HeaderNav`(nav 링크 목록, 활성상태 표시), `AuthAction`(로그인 버튼 ↔ 아바타 그룹 분기)을 추출.
  - 대안(보수적): AppHeader/LandingHeader 유지하되 **LandingHeader에 nav 추가 + 공용 `HeaderNav` molecule 추출**. 통합보다 변경폭 작음.
- **권장:** `SiteHeader` 통합 + `HeaderNav`·`AuthAction` molecule 추출. 반복 JSX 제거(원칙: 반복 JSX=추출 신호).

### 푸터 확장 — `SiteFooter` 그룹화 + 전역 배치
- `SiteFooter`를 4그룹 구조로 확장(브랜드/둘러보기/서비스/정책). 링크 컬럼은 `FooterColumn`(molecule)로.
- AppShell에도 `SiteFooter` 추가(BottomNav와 간섭 없게: 모바일은 `pb`로 여백 확보 또는 데스크톱 전용 노출).

### 모바일 헤더 네비
- 로그아웃 모바일: 로고+로그인만으로는 탐색 접근 불가 → **햄버거 메뉴(drawer)** 또는 헤더 하단 얇은 탐색 링크 바. (open Q)

## 우선순위
1. **로그아웃 헤더에 공개 탐색 링크 추가**(문제 1) — 가장 시급(공개 유입·AdSense). 저비용.
2. **푸터 전역화 + 그룹 확장**(문제 2·4) — 정책 링크 전역 접근. 저~중.
3. **헤더 organism 통합 리팩터**(문제 3) — 중. 1을 하며 자연스럽게 `HeaderNav` 추출.
4. **커뮤니티 진입점**(06 진행에 맞춰) · 모바일 drawer(선택).

## 작업 분해 (역할)
- **planner** — IA 확정(이 문서) + 열린질문 사용자 확답 반영.
- **designer** — 헤더/푸터 비주얼을 `08-theme-tokens.md`의 새 테마 위에서 확정(warm). 푸터 그룹 레이아웃·간격 토큰.
- **web-dev** — `SiteHeader` 통합 or LandingHeader nav 추가, `HeaderNav`/`AuthAction`/`FooterColumn` molecule 추출, `SiteFooter` 확장 + AppShell 배치. 활성 링크 상태. (신규 `/about` 페이지 여부는 열린질문.)
- **uiux-reviewer** — 상태별 IA 일관성·반응형(모바일 헤더 네비)·접근성(nav 랜드마크·현재 페이지 aria-current)·터치타깃 검수.
- **build-qa** — 셸 회귀(로그인/로그아웃 각 경로에서 헤더·푸터 렌더·링크 정상).

## 완료 기준
- 로그아웃 방문자가 헤더에서 `/explore`·`/places`(및 06 이후 커뮤니티)로 직접 이동 가능.
- 로그인 상태에서도 푸터의 개인정보/이용약관 접근 가능(전역 푸터).
- 헤더 골격 중복 제거(단일 organism 또는 공용 molecule) — 반복 JSX 없음.
- 반응형·접근성(nav 랜드마크·aria-current) uiux-reviewer 패스.

## 열린 질문 (사용자 결정 필요)
1. **헤더 통합 vs 최소 변경** — `SiteHeader` 하나로 통합(권장, 리팩터폭 큼) vs LandingHeader에 nav만 추가(저비용).
2. **소개(About) 페이지 신설 여부** — 푸터 "서비스" 그룹에 `/about`을 새로 만들지, 아니면 랜딩 `/`으로 대체할지.
3. **로그아웃 모바일 탐색 UI** — 햄버거 drawer vs 얇은 탐색 링크 바 vs 생략(모바일은 로그인 유도 위주).
4. **AppShell 푸터 노출 범위** — 전 페이지 vs 데스크톱만 vs 특정 공개 페이지만(BottomNav 간섭 고려).
5. **문의 채널** — 푸터 "문의"를 메일 링크로 둘지, 폼/채널을 만들지.
