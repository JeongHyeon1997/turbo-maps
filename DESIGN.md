# DESIGN.md — maps 디자인 시스템

> 비주얼의 단일 진실. UI 값은 전부 `@maps/tokens`로 코드화한다(하드코딩 금지).
> 소유: `designer` 역할. 이 문서는 초기 방향이며 designer가 확장/확정한다.

## 무드 & 컨셉

**따뜻하고 개인적인(warm / personal)** — 커플이 함께한 순간을 모으는 다정한 공간. 기술적·차가운 느낌 배제.

키워드: 포근함 · 손으로 만든 듯한 · 사진 중심 · 여백 · 부드러운 곡선.

**핵심 은유 — "크림 종이 + 파란 잉크".** 브랜드(WeLog) 로고는 파란 노트북이다. 그래서 캔버스는 따뜻한 크림(종이)이고 브랜드/인터랙션은 블루(잉크)로 잡는다. 로맨스·평점 등 감성 포인트만 코랄로 남긴다 — 블루가 신뢰/구조, 코랄이 애정을 맡는 역할 분리.

### 레퍼런스 (VoltAgent/awesome-design-md)
- **Notion** — warm minimalism, serif 헤딩, soft surface. → 저널/기록 화면의 편안함.
- **Airbnb** — 코랄 액센트, 사진 주도, 라운드 UI. → 장소/추억 카드, "경험" 스토리텔링.
- **Clay** — organic shape, soft gradient. → 빈 상태·일러스트 톤.

우리는 위를 참고하되 아래 토큰으로 소화한다. (근거만 인용, 복제 금지)

## 컬러 (`packages/tokens/src/colors.ts` → 시맨틱은 `theme.ts`)

크림 캔버스 + **블루 브랜드** + 코랄 로맨스 액센트의 따뜻한 뉴트럴. (2026-07 톤 리프레시 — warm 방향 유지, 채도·대비·역할만 다듬음. 다크 모드는 이번 범위 아님.)

**단일 진실 구조:** `colors.ts`는 raw 값, `theme.ts`가 시맨틱 레이어(`theme.color.*`), tailwind는 `theme.color`를 소비. 앱은 raw hex를 직접 만지지 않는다.

| 역할 (semantic) | 값 | 근거 |
| --- | --- | --- |
| **brand** (WeLog blue) | `#1E7CF8` / pressed `#135FD6` / soft `#E9F1FE` | 로고 노트북에서 샘플링한 블루. CTA·링크·활성·포커스 |
| background (cream) | `#FFFBF5` | 종이 캔버스 (기존보다 살짝 밝고 깨끗하게) |
| surface / surfaceAlt | `#FBF5EC` / `#F4ECDF` | 카드 / 함몰 면 |
| text primary/secondary/muted | `#2A2521` / `#6A6058` / `#9A9086` | espresso→taupe. primary≈14:1, secondary≈5.6:1 (AA) |
| textDisabled / onBrand | `#C4BCB0` / `#FFFFFF` | |
| border / borderStrong / divider | `#E9E0D3` / `#D6CBB9` / `#F1EADE` | |
| **rating** (romance coral) | `#F26B60` | 하트·별 등 감성 포인트 (brand blue와 역할 분리) |
| accent (태그/마커) | coral`#F26B60`·sage`#83AC83`·lavender`#AE93DB`·amber`#E7A23F`·sky`#6FAEE6` | 채도 살짝 낮춰 warm 톤 통일 |
| states | danger`#D0453C` success`#2F9E5B` warning`#DE912F` info`#1E7CF8` | danger는 텍스트 AA(≈5.3:1) 확보, info는 brand와 정렬 |

- **대비:** 본문 텍스트(primary/secondary)는 배경 대비 WCAG AA(4.5:1) 이상. brand blue 텍스트(`text-brand`)는 cream 위 ≈3.9:1 — **큰/세미볼드 UI 텍스트·링크·아이콘용(AA large 3:1 충족)**, 긴 본문에는 쓰지 않는다(그럴 땐 textPrimary). 이전 코랄 브랜드(≈3.3:1)보다 개선. brand/코랄 채움 위 텍스트는 흰색.
- **역할 분리:** 블루=구조·신뢰·인터랙션, 코랄(rating/accent)=애정·강조. 둘을 인터랙션에 섞지 않는다.
- **다크 모드:** 이번 범위 아님. 후속 과제로 warm dark(짙은 브라운 계열) 확장 예정 — 그때 `theme.ts`에 라이트/다크 변형 구조 추가.

### 커버 그라디언트 (`coverGradients` / `coverTints`)

데이트 로그 카드의 **사진 없을 때 폴백 커버**. 사진이 없거나 로딩 실패 시 이 그라디언트로 카드 상단을 채운다(top-left → bottom-right 선형 그라디언트 권장). 5쌍을 date-log id/index로 순환 배정해 피드가 단조롭지 않게 한다.

- **단일 소스:** `packages/tokens/src/colors.ts`. 앱 3곳(`page.tsx`, `lib/explore.ts`, `lib/mock/date-logs.ts`)에 하드코딩돼 있던 중복은 `@maps/tokens`의 `coverGradients`로 대체한다(web-dev 작업). **하드코딩 금지.**
- **구조:** 각 쌍은 `[from, to]` — 밝은 warm 틴트(`coverTints`) → 그에 대응하는 액센트(`accentPalette`). 어두운 정지점은 accent 팔레트를 **재사용**해 마커/태그와 색 언어를 통일했다.

| # | from (tint) | to (accent) | 짝 |
| --- | --- | --- | --- |
| 0 | `peach` `#F8C9AC` | `coral` `#F26B60` | 따뜻한 살구→코랄 (기본 톤) |
| 1 | `mint` `#BCE3BD` | `sage` `#83AC83` | 민트→세이지 |
| 2 | `lilac` `#D6C4EC` | `lavender` `#AE93DB` | 라일락→라벤더 |
| 3 | `honey` `#FBE0A6` | `amber` `#E7A23F` | 허니→앰버 |
| 4 | `powder` `#BEDFF4` | `sky` `#6FAEE6` | 파우더→스카이 |

- **틴트 명명:** hex가 아닌 hue 의미로 읽히게 warm 방향 이름 부여(peach/mint/lilac/honey/powder). 근거: Airbnb의 사진 주도 카드 톤을 우리 warm 팔레트로 소화 — 사진이 없어도 카드가 "빈" 느낌 대신 다정한 색면이 되도록.
- **대비:** 커버는 장식 면(텍스트를 직접 얹지 않음)이 원칙. 커버 위에 텍스트를 얹을 경우 코랄/앰버 쪽에 다크 스크림(반투명 오버레이) 필수.
- **exports:** `coverGradients`(5쌍 `as const`), `coverTints`(hue→hex), 타입 `CoverGradient`(`readonly [from, to]`)·`CoverTint`. `theme.*`로도 접근 가능하게 후속 반영은 designer가(현재는 named export로 소비).

## 타이포 (`packages/tokens/src/typography.ts`)

- 본문/UI: Pretendard(국문) → system sans 폴백. 헤딩은 약간 큰 대비 + tight letter-spacing(-0.02em, 국문).
- 스케일: display / h1 / h2 / body / caption. 라인하이트 넉넉하게(가독성).

### Pretendard 로딩 방침 (구현: web-dev)

**현재 상태(문제):** tailwind `fontFamily.sans` 1순위가 Pretendard(`fontFamily.sans` 토큰과 동일)인데 실제 웹폰트 로딩이 없어 지금은 system sans(-apple-system 등)로 **폴백 렌더링** 중이다. 의도한 warm/personal 톤(Pretendard의 부드러운 국문 자형)이 나오지 않는다.

**권장 방식:** apps/web은 앱(사내 서비스)이라 CSP 제약이 느슨하므로 **jsDelivr의 Pretendard dynamic-subset**을 `globals.css`에서 로드한다. 국문 페이지 초기 로드 용량을 subset이 크게 줄여준다.

```css
/* apps/web/src/app/globals.css — 예시 (web-dev가 구현) */
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/variable/pretendardvariable-dynamic-subset.css');
```

- 대안: `next/font/local`로 Pretendard variable을 self-host(오프라인/성능·프라이버시 우선 시). 이 경우 CSS 변수를 `fontFamily.sans` 앞에 끼운다. jsDelivr `@import`가 더 간단해 1차 권장.
- **로딩 후에도 토큰은 그대로:** `fontFamily.sans` 값은 이미 `'Pretendard, …폴백'`이므로 폰트만 실제 로드되면 자동 적용된다. 토큰 변경 불필요.
- **letter-spacing tight 적용 지점:** `theme.font.letterSpacingTight`(`-0.02em`)를 **국문 헤딩/타이틀**(display, title, subtitle 및 큰 숫자·라벨)에 적용. 본문(body)·caption은 기본(0) 유지 — tight를 소형 텍스트에 과용하면 가독성이 떨어진다. web은 tailwind `letterSpacing` 확장 또는 헤딩 컴포넌트에서 토큰 참조로 적용(하드코딩 `-0.02em` 금지, `theme.font.letterSpacingTight` 경유).

## 간격 · 라운드 · 섀도 (`packages/tokens/src/spacing.ts`)

- 라운드: 카드·이미지 `lg~xl`로 부드럽게. 버튼은 pill 또는 md.
- 여백: 넉넉하게(개인적/편안). 섀도는 얕고 따뜻하게(순수 블랙 그림자 금지, 살짝 브라운 틴트).
- **섀도 구현:** `shadow.sm/md/lg`는 `rgba(42,37,33,·)`(textPrimary 브라운) 틴트로 정의됨 — 순수 블랙 금지 원칙을 토큰에서 강제. tailwind `shadow-sm/md/lg`로 소비.

## Atomic Design 인벤토리 (구현: web-dev / app-dev)

web/mobile **별도 구현**, 토큰/스키마만 공유.

- **atoms** — Button, IconButton, TextField, Tag/Chip(카테고리), Avatar, Rating(하트/별), Thumbnail, MapMarker.
- **molecules** — FormField, SearchBar(장소검색), PlaceCard, DateLogCard, RatingInput, PhotoThumbGrid item, CoupleBadge.
- **organisms** — AppHeader, PlaceList, DateLogFeed, RouteMap(Kakao), PhotoGallery, DateLogEditor.
- **templates** — AppShell(헤더+콘텐츠+탭바), FeedScreen, DetailScreen, EditorScreen.

원칙: 작은 재사용 컴포넌트 다수. 반복 JSX = 추출 신호. import는 아래로만.

## 지도 UI (Kakao Map)

- 마커/경로 라인은 accent 팔레트 사용(경로는 coral 라인 + 방문지 마커) — 지도는 warm accent 언어를 유지한다. brand blue는 UI 크롬(버튼/탭/링크)에 예약하고 지도 데이터 레이어와 섞지 않아 정보 구분이 선명해진다. 지도 위 오버레이 카드는 surface + soft shadow.

## 접근성
- 터치 타깃 ≥ 44px, 색만으로 정보 전달 금지(아이콘/텍스트 병행), 폼 라벨 필수.
