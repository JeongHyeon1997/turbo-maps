---
status: todo
last-updated: 2026-07-09
owner: planner
---

# 색감·테마 변경 + `theme.ts` 정의

> 소유 실행: **designer + uiux-reviewer 협업**(실제 색 결정·`theme.ts` 구현·비주얼 검증). planner는 범위·역할분담·산출물·의사결정 포인트만 정의.
> 연관: `DESIGN.md`(warm/personal 방향·정식 팔레트의 단일 진실), `packages/tokens`, `07-header-footer.md`(새 테마 위에서 헤더/푸터).
> 목적: 사용자가 **색감/비주얼을 바꾸고 싶어하고, `theme.ts`를 정의해 앱에서 쓰길** 원한다. 현 `packages/tokens`·`DESIGN.md`와의 관계를 진단하고, `theme.ts`가 tokens와 어떻게 공존/대체할지 스코핑.

## 현황 진단 (2026-07-09)

### 토큰 구조
- `packages/tokens/src/`: `colors.ts`(raw 값·팔레트) · `typography.ts` · `spacing.ts` · `theme.ts`(통합 `theme` 객체) · `index.ts`(배럴).
- **web의 실제 소비 경로 = Tailwind config.** `apps/web/tailwind.config.ts`가 `colors`·`radius`·`spacing` **named export**를 import해 tailwind 클래스(`bg-background`·`text-text-secondary`·`border-divider`…)로 매핑. 컴포넌트는 이 클래스를 씀.
- 코드에서 직접 import되는 named export: `colors`·`accentPalette`·`coverGradients`(page/logs/login/KakaoMap/AppShell 등 소수).

### 핵심 발견 — `theme.ts`는 **이미 존재하지만 (a) web에서 실제로 안 쓰이고 (b) morun(러닝앱) 잔재로 오염**됨
- `theme.ts`의 통합 `theme` 객체는 **web 어디서도 import되지 않는다**(tailwind는 `colors`를 직접 소비, 컴포넌트는 클래스 사용). 즉 지금 `theme.ts`는 **사실상 죽은 코드**.
- 오염된 잔재(러닝앱 morun에서 복제된 흔적):
  - `medalPalette`(1-2-3 메달), `territoryPalette`(= accent 별칭), `theme.color.territory/medal` — **커플 기록 앱과 무관**.
  - `ink: '#3C3C3C' — Figma "black"` 주석은 **틀림**(실제 `colors.ink`는 `#2B2622`). `borderSoft: '#EAEAEA' — Figma "gray2"` 주석도 실제 값(`#EFE7DA`)과 불일치 — 러닝앱 주석이 그대로 남음.
  - `theme.color.tabBarDark`, `theme.layout.appColumnWidth: 428 / appColumnHeight: 926 / tabBarNotchRadius`(러닝앱 Figma 프레임 428×926) — 우리 반응형 웹/커플앱과 무관.
  - `textStyle`/`textOnDark` 등 일부는 유효하나 전반적으로 **정리 안 된 상태**.
- `colors.ts`에도 잔재: `medalPalette`, `territoryPalette`, `tabBarDark`, "Rating/highlight tiers (repurposed from a 1-2-3 scale)" 주석.

### 결론
사용자의 "`theme.ts` 정의" 요청은 **새 파일 신설이 아니라, 죽고 오염된 기존 `theme.ts`를 (1) 잔재 제거 (2) 커플앱 시맨틱으로 재정의 (3) 실제 앱이 소비하게 배선**하는 작업이다. 동시에 "색감 변경"은 **`colors.ts`의 warm 팔레트를 새 방향으로 교체/조정**하는 작업 — 이건 designer가 실제 색을 정한다.

## 방안 후보 — `theme.ts` ↔ tokens 관계

### 옵션 A. `theme.ts` = tokens를 조립한 **단일 시맨틱 소비 레이어**(권장)
- raw 값은 `colors.ts`/`spacing.ts`/`typography.ts`에 유지. `theme.ts`는 이들을 **시맨틱 구조로 조립**한 앱 소비 진입점(`theme.color.*`, `theme.font.*`, `theme.radius`…).
- **tailwind.config가 `theme`를 소비하도록 전환** — 지금은 `colors`를 직접 읽는데, `theme.color.*`를 읽게 바꿔 "앱은 theme.ts만 본다"를 실현. 컴포넌트가 직접 값이 필요할 때도 `theme.*`.
- 잔재(medal/territory/tabBarDark/layout 428×926) 제거. 시맨틱만 남김.
- **장점:** 단일 진입점, DESIGN.md와 1:1, 잔재 청산. **단점:** tailwind 배선 변경(회귀 주의).

### 옵션 B. `theme.ts`를 앱(web) 레벨로 두고 tokens는 raw만
- `packages/tokens`는 raw 값만, `apps/web`에 앱 전용 `theme.ts`(브랜드 시맨틱). mobile은 별도.
- **단점:** web/mobile가 시맨틱을 각자 정의 → 교차 플랫폼 일관성 약화. CLAUDE.md의 "토큰은 packages/tokens only" 원칙과 마찰. **비권장.**

### 옵션 C. 최소 — 잔재만 제거, 배선은 현행 유지
- `theme.ts`/`colors.ts`에서 morun 잔재만 걷어내고 tailwind는 계속 `colors` 직접 소비. `theme.ts`는 여전히 보조.
- **장점:** 저위험. **단점:** 사용자의 "theme.ts를 앱에서 쓰고 싶다"를 절반만 충족.

> **권장: 옵션 A**(theme.ts 단일 시맨틱 레이어 + tailwind가 소비 + 잔재 청산). 사용자의 요청 의도("theme.ts 정의해서 앱에서 쓴다")에 가장 맞음. 회귀 위험은 build-qa로 통제.

## 색감 변경 스코프 (designer 주도)
- **planner는 색을 정하지 않는다.** designer가 DESIGN.md 위에서 새 팔레트를 확정하고 `colors.ts`에 반영. uiux-reviewer가 대비(WCAG AA)·일관성 검증.
- 의사결정 포인트(designer/사용자):
  - warm/personal **방향 유지 vs 톤 조정**(예: 코랄 채도·크림 밝기) vs **방향 전환**(예: 다른 액센트 체계).
  - accent 팔레트(coral/sage/lavender/amber/sky)·`coverGradients`도 함께 갈지(카드 폴백 커버가 여기 묶임).
  - **다크 모드**를 이번에 열지(DESIGN.md에 "후속 과제"로 이미 언급 — warm dark). 열면 `theme.ts`에 라이트/다크 변형 구조 필요.

## 작업 분해 (역할)
- **planner** — 범위·옵션 확정(이 문서) + 열린질문 사용자 확답.
- **designer** — (1) 새 색 팔레트 확정 → `colors.ts` 반영 + DESIGN.md 갱신. (2) `theme.ts` 시맨틱 구조 재정의(잔재 제거·커플앱 시맨틱). (3) 다크모드 열 경우 변형 구조.
- **uiux-reviewer** — 대비/접근성/일관성·다크모드(열 경우) 검증, DESIGN.md 정합.
- **web-dev** — (옵션 A 채택 시) tailwind.config가 `theme` 소비하도록 전환, 직접 import 지점(`colors`→`theme.color`) 정리, Pretendard 로딩(DESIGN.md 방침 미구현분) 확인. **회귀 없이.**
- **app-dev** — mobile도 동일 `theme.ts` 소비하도록 정렬(웹 안정 후).
- **build-qa** — 색/토큰 전환 후 시각 회귀·빌드·타입 게이트.

## 완료 기준
- `theme.ts`가 morun 잔재(medal/territory/tabBarDark/layout 428×926/오류 주석) 없이 커플앱 시맨틱으로 정리됨.
- (옵션 A) 앱이 `theme.ts`를 실제 소비(tailwind가 theme 경유, 직접값도 `theme.*`).
- 새 색 팔레트가 `colors.ts`+DESIGN.md에 반영되고 WCAG AA 대비 충족(uiux-reviewer 패스).
- 하드코딩 UI 값 없음(전부 토큰 경유). build-qa 회귀 통과.

## 열린 질문 (사용자 결정 필요)
1. **`theme.ts` ↔ tokens 관계** — 옵션 A(theme.ts를 단일 시맨틱 소비 레이어로 + tailwind가 소비)로 갈지, 옵션 C(잔재만 제거·배선 유지)로 최소 변경할지.
2. **색감 변경 강도** — warm/personal 유지하며 톤만 조정 vs 팔레트 방향 자체를 바꿀지(designer가 시안 제시하면 사용자 선택).
3. **다크 모드** — 이번에 함께 열지(작업량↑) 아니면 라이트만 유지하고 후속.
4. **coverGradients/accent 동반 변경** — 색 바꿀 때 카드 폴백 커버·마커 팔레트까지 같이 갈지(묶여 있음).
