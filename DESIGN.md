# DESIGN.md — maps 디자인 시스템

> 비주얼의 단일 진실. UI 값은 전부 `@maps/tokens`로 코드화한다(하드코딩 금지).
> 소유: `designer` 역할. 이 문서는 초기 방향이며 designer가 확장/확정한다.

## 무드 & 컨셉

**따뜻하고 개인적인(warm / personal)** — 커플이 함께한 순간을 모으는 다정한 공간. 기술적·차가운 느낌 배제.

키워드: 포근함 · 손으로 만든 듯한 · 사진 중심 · 여백 · 부드러운 곡선.

### 레퍼런스 (VoltAgent/awesome-design-md)
- **Notion** — warm minimalism, serif 헤딩, soft surface. → 저널/기록 화면의 편안함.
- **Airbnb** — 코랄 액센트, 사진 주도, 라운드 UI. → 장소/추억 카드, "경험" 스토리텔링.
- **Clay** — organic shape, soft gradient. → 빈 상태·일러스트 톤.

우리는 위를 참고하되 아래 토큰으로 소화한다. (근거만 인용, 복제 금지)

## 컬러 (`packages/tokens/src/colors.ts`)

크림 캔버스 + 코랄 액센트의 따뜻한 뉴트럴.

| 역할 | 값 |
| --- | --- |
| primary (coral) | `#E8635C` / pressed `#C94E48` |
| background (cream) | `#FFFCF7` |
| surface / surfaceAlt | `#FBF6EE` / `#F3ECE0` |
| text primary/secondary/muted | `#2B2622` / `#6B6259` / `#9C9288` |
| border / divider | `#EAE1D4` / `#F0E9DD` |
| accent (태그/마커) | coral·sage`#8FB08A`·lavender`#B79BD9`·amber`#E7A54B`·sky`#7FB4E0` |
| states | danger`#D64545` success`#3C9A5F` warning`#E0912F` info`#3A7BD5` |

- **대비:** 본문 텍스트는 배경 대비 WCAG AA(4.5:1) 이상. 코랄 위 텍스트는 흰색.
- **다크 모드:** 후속 과제 — warm dark(짙은 브라운 `#221E1A` 계열)로 확장 예정. 토큰에 다크 변형 추가는 designer가.

### 커버 그라디언트 (`coverGradients` / `coverTints`)

데이트 로그 카드의 **사진 없을 때 폴백 커버**. 사진이 없거나 로딩 실패 시 이 그라디언트로 카드 상단을 채운다(top-left → bottom-right 선형 그라디언트 권장). 5쌍을 date-log id/index로 순환 배정해 피드가 단조롭지 않게 한다.

- **단일 소스:** `packages/tokens/src/colors.ts`. 앱 3곳(`page.tsx`, `lib/explore.ts`, `lib/mock/date-logs.ts`)에 하드코딩돼 있던 중복은 `@maps/tokens`의 `coverGradients`로 대체한다(web-dev 작업). **하드코딩 금지.**
- **구조:** 각 쌍은 `[from, to]` — 밝은 warm 틴트(`coverTints`) → 그에 대응하는 액센트(`accentPalette`). 어두운 정지점은 accent 팔레트를 **재사용**해 마커/태그와 색 언어를 통일했다.

| # | from (tint) | to (accent) | 짝 |
| --- | --- | --- | --- |
| 0 | `peach` `#F6C6A8` | `coral` `#E8635C` | 따뜻한 살구→코랄 (기본 톤) |
| 1 | `mint` `#BFE3C0` | `sage` `#8FB08A` | 민트→세이지 |
| 2 | `lilac` `#D9C6EE` | `lavender` `#B79BD9` | 라일락→라벤더 |
| 3 | `honey` `#FCE1A8` | `amber` `#E7A54B` | 허니→앰버 |
| 4 | `powder` `#BFE0F5` | `sky` `#7FB4E0` | 파우더→스카이 |

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

## Atomic Design 인벤토리 (구현: web-dev / app-dev)

web/mobile **별도 구현**, 토큰/스키마만 공유.

- **atoms** — Button, IconButton, TextField, Tag/Chip(카테고리), Avatar, Rating(하트/별), Thumbnail, MapMarker.
- **molecules** — FormField, SearchBar(장소검색), PlaceCard, DateLogCard, RatingInput, PhotoThumbGrid item, CoupleBadge.
- **organisms** — AppHeader, PlaceList, DateLogFeed, RouteMap(Kakao), PhotoGallery, DateLogEditor.
- **templates** — AppShell(헤더+콘텐츠+탭바), FeedScreen, DetailScreen, EditorScreen.

원칙: 작은 재사용 컴포넌트 다수. 반복 JSX = 추출 신호. import는 아래로만.

## 지도 UI (Kakao Map)

- 마커/경로 라인은 accent 팔레트 사용(경로는 coral 라인 + 방문지 마커). 지도 위 오버레이 카드는 surface + soft shadow.

## 접근성
- 터치 타깃 ≥ 44px, 색만으로 정보 전달 금지(아이콘/텍스트 병행), 폼 라벨 필수.
