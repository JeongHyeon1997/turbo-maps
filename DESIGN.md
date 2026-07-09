# DESIGN.md — maps 디자인 시스템

> 비주얼의 단일 진실. UI 값은 전부 `@maps/tokens`로 코드화한다(하드코딩 금지).
> 소유: `designer` 역할. 실행 계획·순서는 `docs/plan/08-theme-tokens.md` 참고.
> **2026-07-09 방향 전환** — uiux-reviewer의 토스(Toss) UX 진단 + 사용자 확정에 따라
> "warm/무지개/warm-dark" 서술을 **웜 뉴트럴 미니멀리즘(토스풍)**으로 교체. 브랜드 온기 "한 스푼" 철학은 유지.

## 무드 & 컨셉

**웜 뉴트럴 미니멀리즘 (warm-neutral minimalism, 토스풍).** 면(surface)으로 정보를 나누고, 색은 아껴 쓰고, 인터랙션은 하나의 브랜드 블루로 통일한다. 기록이 주인공이 되도록 UI는 **조용한 배경**으로 물러난다.

- **면 분리(토스식):** 웜 오프화이트 캔버스 위에 **흰 카드**를 얹어 깊이를 만든다. 배경색이 아니라 카드 대비로 구조를 읽힌다.
- **색 절제:** 인터랙션(링크·CTA·활성·포커스)은 **브랜드 블루 하나**. 감성색(coral)은 rating(하트·별) 전용으로 강등. 무지개 accent는 무채색/브랜드소프트로 축소.
- **온기 한 스푼:** 완전한 무채색이 아니라 **웜기를 살짝 남긴 뉴트럴**(오프화이트/웜그레이). 커플의 다정한 기록이라는 정체성을 색이 아니라 온도로 남긴다.

키워드: 여백 · 면 분리 · 사진 중심 · 조용한 UI · 하나의 인터랙션 색 · 웜 뉴트럴.

**핵심 은유 — "웜 종이 위 파란 잉크".** 브랜드(위로그) 로고는 파란 노트북이다. 캔버스는 웜 오프화이트(종이), 인터랙션은 블루(잉크) 하나. 감성 포인트만 coral로 남긴다 — 블루가 신뢰/구조/인터랙션, coral이 애정(rating)을 맡는 **역할 분리**.

### 레퍼런스
- **Toss** — 면 분리(흰 카드 on 그레이 캔버스), 단일 인터랙션 색, 넉넉한 터치타깃, 절제된 모션. → 우리의 1차 UX 렌즈.
- **Notion** — minimalism, soft surface, 조용한 UI. → 저널/기록 화면의 편안함.
- **Airbnb** — 사진 주도, 라운드 UI. → 장소/추억 카드(단, 코랄 액센트 남발은 배제).

위를 참고하되 아래 토큰으로 소화한다. (근거만 인용, 복제 금지)

## 컬러 (`packages/tokens/src/colors.ts` → 시맨틱은 `theme.ts` → CSS 변수)

웜 오프화이트 캔버스 + **흰 카드** + **단일 브랜드 블루** + coral(rating 전용)의 웜 뉴트럴. (2026-07 방향 전환 — 면 분리·색 절제·다크모드 포함.)

**단일 진실 구조 (배선 완료 2026-07-09):** `colors.ts`는 raw hex(`colors` = 라이트, `colorsDark` = 다크) → `theme.ts`가 시맨틱 레이어(`theme.color.*` 라이트 + `theme.colorDark.*`) → `css-vars.ts`가 각 시맨틱 색을 **`--color-*` 변수(채널값 `"R G B"`)로 발행**(`lightCssVars`/`darkCssVars`). tailwind는 `rgb(var(--color-*) / <alpha-value>)` 형태로 소비하고(정적 hex 아님), `:root`(라이트)·`.dark`(차콜) 변수는 tailwind base 플러그인이 토큰 맵에서 주입한다 — **globals.css에 hex 직박 없음.** 런타임 토글은 web-dev가 `<html class="dark">`를 붙여 수행(`darkMode: 'class'`). 앱은 raw hex를 직접 만지지 않는다. 배선 상세는 `08-theme-tokens.md`.

**채널 발행 이유(리스크#1 해소):** 변수를 `rgb(...)` 완성형이 아니라 채널(`"30 124 248"`)로 발행해야 Tailwind 알파 유틸(`bg-background/90`·`to-brand/10`·`border-danger/30`)이 `<alpha-value>` 자리에 opacity를 합성할 수 있다. `bg-brand`처럼 opacity 없이 쓰면 `<alpha-value>`가 `1`로 치환된다. 기존 클래스명(`bg-background`·`bg-surface`·`text-text-primary/secondary/muted`·`text-brand`·`border-border`·`divide-divider`·`bg-brand-soft` 등)은 **전부 그대로 동작**(값만 변수로).

### 라이트 (웜 뉴트럴) — 확정값

| 역할 (semantic) | CSS 변수 | 값 | 근거 |
| --- | --- | --- | --- |
| **brand** (위로그 blue) | `--color-brand` / `-pressed` / `-soft` | `#1E7CF8` / `#135FD6` / `#E9F1FE` | 로고 노트북 블루. **단일 인터랙션 색** — 링크·CTA·활성·포커스 전부 |
| background (canvas) | `--color-background` | `#F7F5F1` | 카드가 아니라 **판**. 흰 카드를 얹기 위해 살짝 낮춘 톤 |
| surface (카드) | `--color-surface` | `#FFFFFF` | 캔버스 위 흰 카드(토스식 면 분리) |
| surfaceAlt (함몰/보조 면) | `--color-surface-alt` | `#EFECE6` | 입력 트랙·구분 면 |
| text primary/secondary/muted | `--color-text-*` | `#1F1D1B` / `#5C5852` / `#8A857E` | primary ≈15:1, secondary ≈6.5:1(AA 본문), muted ≈3.6:1(AA large — 메타/비필수 전용) |
| textDisabled / onBrand | `--color-text-disabled` / `-on-brand` | `#B8B4AD` / `#FFFFFF` | |
| border / borderStrong / borderSoft / divider | `--color-border*` / `-divider` | `#E6E3DD` / `#D2CEC6` / `#EDE9E3` / `#F1EEE9` | 카드 테두리 or 얕은 그림자 **택1** |
| **rating** (romance coral) | `--color-rating` | `#F26B60` | **하트·별 rating 전용으로 강등**. 인터랙션에 쓰지 않음 |
| accent (태그/마커) | (정적, 미테마) | 뉴트럴 램프 + brand (아래 참고) | 5색 무지개 폐기 |
| states | `--color-danger/success/warning/info` | `#D0453C` / `#2F9E5B` / `#DE912F` / `#1E7CF8` | danger 텍스트 AA 확보, info는 brand와 정렬 |
| input | `--color-input-placeholder` / `-underline` | `#A8A39B` / `#E6E3DD` | placeholder AA large |

- **대비:** 본문 텍스트는 배경 대비 WCAG AA(4.5:1) 이상. brand blue 텍스트/링크는 큰·세미볼드 UI·아이콘용(AA large 3:1). 긴 본문엔 textPrimary. 흰 카드 배경이라 이전 크림보다 대비 여유가 커진다(uiux 확정).
- **역할 분리:** 블루=인터랙션·구조, coral=rating(애정)만. 둘을 섞지 않는다.

### 다크 (뉴트럴 차콜) — **warm brown 아님**

토스풍 다크: 웜 브라운이 아니라 **뉴트럴 차콜**. 계단식 elevation, 순수 블랙 금지.

| 역할 | 값(확정) | 근거 |
| --- | --- | --- |
| **brand** | `#4B9BFF` / pressed `#3A82E0` / soft `#1B2740` | 어두운 배경 대비 확보. soft는 다크 블루-차콜 면 |
| background | `#17171A` | 순수 블랙(`#000`) 금지 |
| surface / surfaceAlt | `#1F1F24` / `#26262C` | **계단식 elevation**(위로 올라갈수록 밝은 면) |
| text primary/secondary/muted | `#EDEDED` / `#A1A1A6` / `#6E6E73` | 순백 아닌 **.92/.60/.40 white의 solid 등가값**. 채널 발행+알파 유틸 호환을 위해 solid로 발행(아래 note) |
| textDisabled | `#55555A` | |
| border / borderStrong / borderSoft / divider | `#2E2E33` / `#3A3A40` / `#252529` / `#232328` | white 오버레이(.10/.06) 등가 solid |
| states | danger `#FF6B60` · success `#3DBB72` · warning `#F0A83C` · info `#4B9BFF` | 다크 대비 위해 밝게 |
| rating | `#FF7A6F` | rating 전용 유지, 다크에서 약간 밝게 |

- **다크 텍스트 발행 방식(note):** DESIGN 방향은 "순백 대신 rgba 3단"이지만, CSS 변수를 **채널값**으로 발행해 알파 유틸(`text-x/70`)을 살리는 아키텍처와 충돌한다(변수에 alpha를 미리 굽지 못함). 그래서 3단을 **차콜 위 합성 등가 solid 그레이**(`#EDEDED`/`#A1A1A6`/`#6E6E73`)로 발행한다 — 위계·눈부심 완화 의도는 동일하게 유지되고, opacity 유틸도 정상 동작한다.

- **테마 3-way 토글:** 시스템 / 라이트 / 다크. 기본=시스템. `prefers-color-scheme` 추종 + 사용자 선택 저장. 구현은 provider(`08` web-dev 파트).

### accent 축소 (무지개 폐기)

기존 5색(coral/sage/lavender/amber/sky) 무지개를 **웜 뉴트럴 톤 램프 + brand**로 축소했다(`accentPalette` 확정: coral `#736E67` / sage `#8E8A83` / lavender `#A29E97` / amber `#B8B4AD` / sky `#1E7CF8`=brand). 태그/칩/마커는 색이 아니라 **면·테두리·라벨(텍스트/아이콘)·톤**으로 구분한다. coral은 accent에서 빠지고 **rating 전용**. **키는 유지(back-compat)** — `KakaoMap`(경로선)·`AvatarFallback`·`AppShell`(파트너색)이 아직 `accentPalette.coral/lavender`를 참조하므로 08 리스크#2에 따라 **값만 축소, 키 삭제 금지**. web-dev가 소비처를 brand/뉴트럴로 교체한 뒤 키를 정리한다. 이 램프는 **정적**(런타임 테마 미적용) — 어차피 폐기 예정이라 다크 변형을 만들지 않았다.

### 커버 폴백 단순화 (무지개 그라데이션 폐기)

데이트 로그 카드의 **사진 없을 때 폴백**을 5색 무지개 그라데이션에서 **단일 뉴트럴/브랜드소프트 면 + 아이콘**으로 단순화한다.

- **정책:** 사진 없음 → `surfaceAlt`(또는 `brandSoft`) 단색 면 + 중앙에 중립 아이콘(장소/사진 pin). 카드가 "빈" 느낌 대신 조용한 플레이스홀더가 되도록.
- **영향(리스크):** 현재 `coverGradients`/`coverTints`는 `page.tsx`·`lib/explore.ts`·`DateLogCard`·`KakaoMap`·`AppShell` 등에서 소비된다. 폐기/축소 시 이 소비 지점을 폴백 컴포넌트로 교체해야 함 — `08-theme-tokens.md` 리스크 항목 참고. `coverGradients` export는 즉시 삭제하지 말고 **폴백 전환 후 dead code로 제거**(회귀 방지).

## 타이포 (`packages/tokens/src/typography.ts`)

- **본문·헤딩·UI·숫자 = Pretendard 유지**(clean sans). system sans 폴백.
- **주아체(BMJUA) = 로고 워드마크(위로그)만.** 제품 UI(헤딩/본문/버튼/숫자)에 쓰지 않는다. 배선 완료: `apps/web/src/app/fonts.ts`가 `next/font/local`로 self-host → `--font-jua` 발행, tailwind `fontFamily.jua`(별칭 `logo`)가 참조, `Logo.tsx`에만 `font-jua` 적용. `display:'swap'`+`preload:false`로 첫 페인트 비블로킹(워드마크 한정 로드).
- **한나3(BMHANNA)·꾸불림(BMKkubulim) = 제품 UI 미사용 → 지금 배선 안 함.** ttf 파일은 `apps/web/src/fonts/`에 남겨둠(마케팅/후속용). next/font 등록·tailwind 매핑 없음.
- 폰트 파일 위치: `apps/web/src/fonts/` (`BMHANNA*`, `BMJUA_ttf.ttf`=배선됨, `BMKkubulimTTF.ttf`=미배선).

### 굵기 위계 정리 (extrabold 남발 제거)

extrabold(800) 남발을 정리하고 **bold 헤딩 + regular/medium 본문**의 굵기 대비로 위계를 만든다.

- 헤딩/타이틀: **bold(700)** 기본. display만 필요 시 extrabold 예외 허용(로고성 큰 타이틀 한정).
- 본문: **regular(400)**, 강조는 **medium(500)/semibold(600)**.
- `textStyle.displayLarge`의 `extrabold` → 재검토(대부분 bold로). designer가 `typography.ts` 조정.
- **`letterSpacingTight(-0.02em)`를 국문 헤딩에 실제 적용** — display/title/subtitle·큰 숫자·라벨에. 본문/caption은 0 유지(소형 텍스트 tight 금지). tailwind `tracking-tight`(=`theme.font.letterSpacingTight`) 경유, 하드코딩 금지.

### 로고 폰트 배선 (완료)

- `next/font/local`로 `apps/web/src/fonts/BMJUA_ttf.ttf` self-host → **`--font-jua`** 발행(`fonts.ts`). CSS 변수명은 `--font-jua`로 확정(08 초안의 `--font-logo`를 대체 — 직접 지시 우선). `layout.tsx`가 `<html className={jua.variable}>`로 노출.
- tailwind `fontFamily.jua`(+별칭 `logo`) = `['var(--font-jua)', 'Pretendard', 'sans-serif']`. `Logo` 워드마크에만 `font-jua` 사용. `sans`(Pretendard)는 UI 전역 유지 — 본문/헤딩/숫자 불변.

## 간격 · 라운드 · 섀도 (`packages/tokens/src/spacing.ts`)

- **여백(토스식 넉넉):** 섹션 간격 24~32, 모바일 컨테이너 패딩 20~24(현 16 → **20 권고**). 여백으로 정보를 나눈다.
- **라운드:** 카드 **radius 16**. 버튼은 size별(아래). pill(rounded-full)은 칩·필터·배지 **한정**.
- **면 강조는 택1:** 카드는 **테두리 or 얕은 그림자 중 하나만**(이중 강조 금지). 흰 카드 on 웜 캔버스가 기본, 그림자를 쓰면 테두리 생략.
- **섀도:** 얕고 뉴트럴하게(순수 블랙 금지, 아주 약한 그레이 틴트). `shadow.sm/md/lg` tailwind 소비. 다크모드에선 그림자 대신 elevation 면(밝은 surface)으로 깊이 표현.

## 모션 베이스라인 (구현: web-dev)

- **인터랙티브 기본:** `transition-all duration-200 ease-out`. 버튼·링크·카드 hover/press.
- **press feedback:** 버튼 `active:scale-[0.97]`.
- **포커스 전역:** `focus-visible:ring-2 ring-brand`(키보드 포커스만, 마우스 클릭엔 링 없음).
- **하단 시트:** 모바일 액션/선택은 **bottom sheet 슬라이드업** 패턴.
- **로딩:** 라우트 전환은 `loading.tsx` + **스켈레톤 셔머**(색 깜빡임 대신 면 셔머).

## Atomic Design 인벤토리 (구현: web-dev / app-dev)

web/mobile **별도 구현**, 토큰/스키마만 공유.

- **atoms** — Button(**size 도입**), IconButton, **TextField(신설)**, Tag/Chip(카테고리), Avatar, Rating(하트/별), Thumbnail, MapMarker, ThemeToggle(신규, 3-way).
- **molecules** — FormField, SearchBar(장소검색), PlaceCard, DateLogCard, RatingInput, PhotoThumbGrid item, CoupleBadge, CoverFallback(신규, 사진없음 폴백).
- **organisms** — SiteHeader(통합), SiteFooter, PlaceList, DateLogFeed, RouteMap(Kakao), PhotoGallery, DateLogEditor.
- **templates** — AppShell(헤더+콘텐츠+탭바), PublicShell, FeedScreen, DetailScreen, EditorScreen.

원칙: 작은 재사용 컴포넌트 다수. 반복 JSX = 추출 신호. import는 아래로만.

### Button — `size` 스펙 (신규)

| size | 용도 | 높이 | radius | 타이포 | 기본 |
| --- | --- | --- | --- | --- | --- |
| **lg** | 메인 CTA | 52~56 | 14~16 | text-base semibold | **fullWidth 기본** |
| **md** | 기본 | 44~48 | 12 | — | 터치타깃 확보 |
| **sm** | 보조/인라인 | 36~40 | — | — | |

- pill(rounded-full)은 **칩·필터·배지 한정**(버튼은 사각 라운드).
- 공통: `active:scale-[0.97]` + `focus-visible:ring-2 ring-brand` + `transition-all duration-200 ease-out`.

### TextField — atom 신설

현재 웹에 TextField atom이 없어 `logs/new`가 input을 **4곳+ 반복**한다. 이를 흡수.

- 높이 **52~56**, radius **12**, **흰 배경 + 1px 뉴트럴 테두리**, focus 시 **brand 2px 링**.
- placeholder는 `input-placeholder` 토큰. 라벨은 `FormField`(molecule)로 조합.
- 반복 JSX 제거 신호 — `logs/new`의 반복 input을 이 atom으로 교체.

### 카드

radius 16, **테두리 or 얕은 그림자 택1**(이중 강조 금지), **흰 카드 on 웜 캔버스**. 사진 없을 때는 `CoverFallback`(단색 면 + 아이콘).

## 지도 UI (Kakao Map)

- 마커/경로 라인은 accent 무지개 대신 **brand 계열 + 뉴트럴**로 통일. brand blue는 UI 크롬과 지도 데이터 레이어 둘 다에서 인터랙션/선택을 나타내되, 정보 구분은 **아이콘/라벨/면**으로(색 남발 배제). 경로선은 brand, 방문지 마커는 brand/뉴트럴. 지도 위 오버레이 카드는 흰 surface + 얕은 그림자.

## 접근성
- 터치 타깃 ≥ 44px(md 버튼·TextField가 이를 보장), 색만으로 정보 전달 금지(아이콘/텍스트 병행), 폼 라벨 필수.
- 다크모드 텍스트는 순백 대신 rgba 3단으로 눈부심 완화. focus-visible 링 전역.
</content>
</invoke>
