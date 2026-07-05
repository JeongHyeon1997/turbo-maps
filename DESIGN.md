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

## 타이포 (`packages/tokens/src/typography.ts`)

- 본문/UI: Pretendard(국문) → system sans 폴백. 헤딩은 약간 큰 대비 + tight letter-spacing(-0.02em, 국문).
- 스케일: display / h1 / h2 / body / caption. 라인하이트 넉넉하게(가독성).

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
