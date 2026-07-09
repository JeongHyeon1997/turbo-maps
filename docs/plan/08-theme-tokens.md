---
status: doing
last-updated: 2026-07-09
owner: planner
---

# 색감·테마 재정의 + 다크모드 토글 (웜 뉴트럴 미니멀리즘, 토스풍)

> 소유 실행: **designer**(토큰·색·폰트 배선) → **web-dev**(CSS 변수 재구조화·컴포넌트·테마 provider). uiux-reviewer 검증, build-qa 회귀.
> 연관: `DESIGN.md`(방향·팔레트 단일 진실 — 2026-07-09 전환됨), `07-header-footer.md`(이 테마 위에서 헤더/푸터), `packages/tokens`, `apps/web`.
> **2026-07-09 방향 확정(사용자 승인).** 아래 "확정 결정"이 단일 진실. 열린 질문은 없다.

## 확정 결정 (사용자 승인 2026-07-09)

1. **팔레트 = 웜 뉴트럴 미니멀리즘.** 크림 배경 → **웜 오프화이트 캔버스 + 흰 카드**(토스식 면 분리). 브라운 텍스트 → **웜기 남긴 뉴트럴 그레이**(AA 여유). **블루 `#1E7CF8` = 단일 인터랙션 색**(링크·CTA·활성·포커스 전부).
2. **감성색 절제.** 무지개 5색 커버 그라데이션 → **단일 뉴트럴/브랜드소프트 면 + 아이콘** 폴백. 5색 accent → 무채색/브랜드소프트로 축소. **coral `#F26B60` = rating 전용 강등.**
3. **주아체 = 로고 워드마크(위로그)만.** 본문·헤딩·UI·숫자 = **Pretendard**. extrabold 남발 정리, `letterSpacingTight(-0.02em)` 국문 헤딩 실적용. 한나·꾸불림 제품 UI 미사용. 폰트: `apps/web/src/fonts/`.
4. **다크모드 포함 + 3-way 토글(시스템/라이트/다크).** 다크 = 웜브라운 아니라 **뉴트럴 차콜**(bg `#17171A`급, surface `#1F1F24`급 계단 elevation, 순수 블랙 금지, 텍스트 rgba 3단, brand `#4B9BFF`급). **DESIGN.md 기존 warm-dark(브라운) 방향 → 뉴트럴 차콜로 수정 완료.**

## 선행 작업 — CSS 변수 재구조화 (다크 토글의 전제)

**문제:** 현재 `apps/web/tailwind.config.ts`가 `theme.color.*`의 **정적 hex를 빌드타임에 소비** → 런타임 테마 전환 불가.

**해결:** 시맨틱 색을 **CSS custom properties(`--color-*`)로 발행**하고 tailwind가 그 변수를 소비하도록 전환. 라이트/다크는 `.dark`(또는 `[data-theme="dark"]`) 오버라이드.

- `globals.css`: `:root { --color-brand: #1E7CF8; --color-background: …; … }` (라이트) + `.dark { --color-brand: #4B9BFF; --color-background: #17171A; … }` (다크).
- `tailwind.config.ts`: `colors.brand: 'var(--color-brand)'` … 로 매핑(hex 직접 대신 변수 참조).
- **단일 진실 유지:** `:root`/`.dark`의 변수 값은 `packages/tokens`(`theme.ts`)에서 파생시킨다 — 손으로 hex를 globals.css에 박지 말고, 토큰에서 CSS 변수 문자열을 생성하는 방식(빌드 스크립트 or 토큰이 export하는 `cssVars` 객체)을 designer가 정한다. **하드코딩 금지 원칙 유지.**

## 작업 순서 (의존성)

```
A. designer 토큰 작업  ──┐
   (선행: 없음)          │  A 완료 후 B 착수
B. web-dev 컴포넌트 작업 ─┘  (A의 CSS 변수·토큰이 있어야 컴포넌트가 소비)
   ↓
C. uiux-reviewer 검증 → build-qa 회귀
```

### A. designer — 토큰 & 배선 (선행)

- [ ] **A1. morun 잔재 청산** — `theme.ts`/`colors.ts`의 `medalPalette`·`territoryPalette`·`tabBarDark`·`layout 428×926`·오류 주석(`ink #3C3C3C`, `borderSoft #EAEAEA`) 제거. 커플앱 시맨틱만 남김.
- [ ] **A2. 라이트 팔레트 = 웜 뉴트럴** — `colors.ts` 교체: 웜 오프화이트 background(`#F7F5F1`급) + **흰 surface(카드)** + surfaceAlt(함몰) + 웜뉴트럴 그레이 텍스트(브라운 제거, AA 여유) + 뉴트럴 border. brand `#1E7CF8` 유지. (DESIGN.md 라이트 표의 방향값을 designer가 확정.)
- [ ] **A3. 다크 팔레트 = 뉴트럴 차콜** — `theme.ts`에 라이트/다크 **변형 구조** 추가. bg `#17171A`급, surface 계단 elevation, 텍스트 rgba 3단, brand `#4B9BFF`급, 순수블랙 금지.
- [ ] **A4. CSS 변수 발행 구조** — 시맨틱 색을 `--color-*`로 내보내는 방식 확정(토큰→CSS 변수 파생). tailwind가 변수 소비하도록 `tailwind.config.ts` 매핑 전환. (선행 작업 절 참고. web-dev와 경계 협의: 토큰/발행=designer, globals.css·config 배선=web-dev 가능.)
- [ ] **A5. accent 축소** — `accentPalette`(5색 무지개) → 무채색/브랜드소프트 스케일로 재정의. coral은 accent에서 빼고 `rating` 전용으로만 유지.
- [ ] **A6. 커버 폴백 단순화** — `coverGradients`/`coverTints` 폐기 방향. **즉시 삭제 금지**(소비 지점 있음) — 폴백 컴포넌트(`CoverFallback`) 전환 후 dead code로 제거. 토큰엔 폴백 면색(surfaceAlt/brandSoft) + 아이콘 규칙만 남김.
- [ ] **A7. 타이포 굵기 정리** — `typography.ts` extrabold 남발 정리(displayLarge 등 대부분 bold로). `letterSpacingTight`를 국문 헤딩(display/title/subtitle)에 적용되게 tailwind `tracking-tight` 배선 확인.
- [ ] **A8. 주아 로고폰트 배선** — `fontFamily`에 `logo`(주아) 계열 추가. `next/font/local`로 `BMJUA_ttf.ttf` self-host → `--font-logo` 발행(web-dev와 협의, 배선 자체는 web-dev). Pretendard(`sans`)는 UI 전역 유지.

### B. web-dev — 컴포넌트 & 테마 (A 완료 후)

- [ ] **B1. globals.css CSS 변수 + `.dark` 오버라이드** — A4 발행 구조를 `:root`/`.dark`에 배선. 기존 tailwind 유틸 클래스(`bg-background`·`text-text-secondary`…)가 **그대로 동작**하도록 호환 유지(변수 참조로 바뀌어도 클래스명 불변).
- [ ] **B2. ThemeProvider + ThemeToggle(3-way)** — 시스템/라이트/다크. `prefers-color-scheme` 추종 + 사용자 선택 localStorage 저장 + `<html class="dark">`(또는 `data-theme`) 토글. SSR 깜빡임(FOUC) 방지 스크립트(초기 inline). ThemeToggle atom을 헤더에 배치(07과 연계).
- [ ] **B3. Button size 도입** — `lg`(52~56, radius 14~16, text-base semibold, fullWidth 기본) / `md`(44~48, radius 12) / `sm`(36~40). pill은 칩·필터·배지 한정. `active:scale-[0.97]` + `focus-visible:ring-2 ring-brand` + `transition-all duration-200 ease-out`. 기존 Button 변형과 병합.
- [ ] **B4. TextField atom 신설** — 높이 52~56, radius 12, 흰 배경 + 1px 뉴트럴 테두리, focus brand 2px 링, placeholder 토큰. `logs/new`의 반복 input(4곳+)을 이 atom(+`FormField`)으로 교체.
- [ ] **B5. 카드 정리** — radius 16, 테두리 or 얕은 그림자 **택1**(이중 강조 제거). 흰 카드 on 캔버스. `CoverFallback`(molecule) 신설 — 사진 없을 때 단색 면 + 아이콘. `DateLogCard`/explore/place 카드의 `coverGradients` 소비 지점을 이걸로 교체.
- [ ] **B6. 모션 베이스라인 적용** — 인터랙티브 `transition-all duration-200 ease-out`, focus-visible 링 전역, 라우트 `loading.tsx` 스켈레톤 셔머, (모바일) bottom sheet 슬라이드업 패턴.
- [ ] **B7. 여백 조정** — 모바일 컨테이너 패딩 16→20, 섹션 24~32. (07 헤더/푸터와 함께.)

### C. 검증

- [ ] **uiux-reviewer** — 라이트/다크 대비(WCAG AA), 면 분리 일관성, 터치타깃, focus 링, 모션 일관성, DESIGN.md 정합.
- [ ] **build-qa** — CSS 변수 전환 후 시각 회귀(라이트/다크 각 경로), 빌드·타입·lint 게이트, 테마 토글 스모크.
- [ ] **app-dev(후속)** — mobile도 동일 `theme.ts`(라이트/다크) 소비하도록 정렬. 웹 안정 후.

## 리스크 (실행 전 인지)

1. **CSS 변수 전환 ↔ 기존 tailwind 클래스 호환** — `tailwind.config`가 정적 hex→`var(--color-*)`로 바뀌면, 클래스명은 같아도 **opacity 유틸(`bg-brand/50`)이 CSS 변수 + `<alpha-value>` 문법**을 요구할 수 있다. tailwind가 알파를 적용하려면 변수를 채널값(`R G B`) 형태로 발행해야 함. designer/web-dev가 알파 유틸 사용처를 먼저 감사하고 채널 발행 방식 채택 여부 결정. **회귀 위험 1순위 → build-qa 시각 확인 필수.**
2. **커버 그라데이션 제거 ↔ DateLogCard/explore 영향** — `coverGradients`/`coverTints`는 `page.tsx`·`lib/explore.ts`·`DateLogCard`·`KakaoMap`·`AppShell` 등 다수에서 소비. 토큰을 먼저 지우면 빌드 깨짐. **순서 강제:** `CoverFallback` 컴포넌트로 소비 지점 전량 교체 → 그다음 토큰 export 제거(dead code). B5 전에 A6에서 토큰 export를 없애지 말 것.
3. **다크모드 FOUC** — 초기 렌더에서 라이트→다크 깜빡임. `<head>` inline 스크립트로 첫 페인트 전 클래스 적용 필요(B2).
4. **다크에서 사진/커버** — 흰 카드 전제가 다크에선 차콜 surface로 바뀜. 사진 없는 폴백 아이콘/면색이 다크에서도 대비되게 별도 확인.
5. **주아 폰트 self-host 용량** — `BMJUA_ttf.ttf ≈1.5MB`. 워드마크(로고)만 쓰므로 `next/font/local` + 필요 시 subset. 전역 로드 금지(로고 컴포넌트 한정).

## 완료 기준

- 라이트/다크 팔레트가 `colors.ts`+`theme.ts`(변형 구조)에 반영, CSS 변수로 발행, tailwind가 변수 소비. WCAG AA 충족(uiux 패스).
- 3-way 테마 토글 동작(시스템/라이트/다크, FOUC 없음, 선택 저장).
- Button size(lg/md/sm) + TextField atom + CoverFallback 존재, `logs/new` 반복 input 흡수, 카드 이중강조 제거.
- 주아=로고 워드마크만, UI는 Pretendard, extrabold 정리, 국문 헤딩 tracking-tight 적용.
- morun 잔재 없음, 하드코딩 UI 값 없음(전부 토큰/변수 경유), build-qa 회귀 통과.
</content>
</invoke>
