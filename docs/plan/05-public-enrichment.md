---
status: todo
last-updated: 2026-07-07
owner: planner
---

# 서비스 풍부화 — 공개 콘텐츠 깊이 + SEO (AdSense 도입 전 단계)

> 선행: `04-public-surface.md`(1·2단계 라이브 완료). 후속: `03-adsense.md`.
> 목적: **로그인 없이도 볼 수 있는 가치 있는 공개 콘텐츠**를 늘려 AdSense 심사 통과 + 서비스 깊이 확보.

## 배경 / 왜 지금
공개 표면 1·2단계가 라이브다: 로그아웃 랜딩 `/`, `/privacy`, `/terms`, 공개 `/explore`(anon-safe 뷰
`explore_logs`/`explore_log_places` 기반, 공개 커버는 `public-covers` 무토큰 URL). 그러나 AdSense 관점에서
**공개 표면이 아직 얕다** — 크롤 가능한 개별 URL은 사실상 4개(`/`·`/explore`·`/privacy`·`/terms`)뿐이고,
`/explore`는 카드 피드 한 장일 뿐 **개별 기록으로 들어가는 URL이 없다**(카드 비링크 처리). 콘텐츠 깊이·체류가치·
검색 유입 표면이 모두 부족하다.

동시에 **보안 백로그 1건**이 이 작업으로 정공법 해결된다: `/logs/[id]`는 `date_logs`의 public-select 정책이
`to authenticated`(커플 스코프 아님)여서 **로그인 유저가 남의 공개 로그 상세를 직결 조회하면 memo까지 노출**된다.
공개 상세를 anon-safe 뷰 기반 별도 페이지로 만들고 base 테이블의 광역 authenticated public-select를 제거하면
이 갭이 닫힌다(아래 A + DECISIONS ADR).

## 목표
1. **개별 공개 URL 수를 크게 늘린다** — 공개 코스 상세 + place 페이지 = 콘텐츠가 늘수록 URL이 자동 증식.
2. **검색 유입 표면 확보** — sitemap/robots/OG/구조화 데이터 등 SEO 기반공사.
3. **프라이버시 원칙 계승** — 사적 필드(memo) 절대 비노출, copy-on-publish, 원본 무손상. anon은 안전 뷰로만.
4. AdSense 심사 통과 조건(공개적으로 접근 가능한, 가치 있는, 다수의 콘텐츠 페이지)을 충족.

## 현황 진단 (2026-07-07)

### 로그아웃 방문자가 지금 **볼 수 있는 것**
- `/` 마케팅 랜딩(hero/features/공개 코스 미리보기 + 정책 링크).
- `/explore` 공개 코스 피드 카드(제목·날짜·장소명·평점·공개 커버 or 그라데이션 폴백·작성자 닉네임). **display-only.**
- `/privacy`, `/terms` 정책 페이지.

### 볼 수 **없는 것 / 공백**
- **공개 코스 상세가 없다.** explore 카드가 어디로도 안 열린다(개별 permalink 부재).
- **place(장소) 페이지가 없다** — 맛집/카페 단위 집계·공개 방문 이력이 없음(검색 유입 최대 축이 비어있음).
- **지역/카테고리 탐색이 없다**(예: "연남동 데이트 코스", "성수 카페").
- **SEO 기반 전무** — `sitemap.xml` 없음, `robots.txt` 없음, per-page OG 없음(랜딩 정적 OG만), JSON-LD 없음.
- 정렬/큐레이션 없음(인기·최신). explore는 date desc 단순 나열.

### AdSense 관점 정량 요약
| 항목 | 현재 | 목표(심사 유리) |
| --- | --- | --- |
| 크롤 가능한 개별 URL | ~4개 (정적) | 수십~수백(코스 상세 + place, 콘텐츠 따라 증식) |
| 콘텐츠 깊이 | 카드 1줄 요약 | 상세(장소 목록·지도·평점·사진 커버·구조화 데이터) |
| SEO 신호 | 없음 | sitemap/robots/canonical/OG/JSON-LD |
| 체류가치 | 낮음(피드 훑기) | 코스→장소→지역 회유(내부 링크 그래프) |

## 풍부화 방안 후보 (우선순위·근거)

각 항목: 사용자가치 / AdSense·SEO 기여 / 난이도 / 의존성 / 프라이버시 주의.

### A. 공개 코스 상세 페이지 (최우선) — anon-safe 뷰 기반 전용 페이지
비로그인·로그인 모두 열람 가능한 공개 코스 상세. 경로는 **`/explore/[id]`**(explore 하위 = 미들웨어 이미 public,
permalink 안정). `/logs/[id]`(커플 전용)와 **별도 페이지**로 분리 — 뷰(`explore_logs`/`explore_log_places` + 새
`explore_log_route`)만 읽어 memo·private cover는 구조적으로 접근 불가.
- **사용자가치:** 카드 클릭 → 코스 전체(방문 장소 순서·평점·공개 커버·지도 마커) 열람. explore 카드 링크 활성화.
- **AdSense·SEO:** 공개 로그 1건 = 크롤 URL 1개. 콘텐츠 깊이 급상승. per-log OG(공개 커버) + JSON-LD 가능.
- **난이도:** 중. web 페이지 + `generateMetadata` + (route 좌표 노출 시) 뷰 1개 추가.
- **의존성:** 없음(0006 뷰 라이브됨). route 좌표 공개는 open Q(경로선 vs 마커).
- **프라이버시:** ⚠️ 뷰만 읽는다. memo/갤러리/private cover 비노출. **base 테이블 `to authenticated` public-select
  정책 제거**로 memo 노출 백로그 정공 해결(DECISIONS ADR). 작성자 닉네임 공개 범위는 open Q.

### B. place(장소) 공개 페이지 + 디렉터리 (콘텐츠 볼륨 최대 축)
`/places/[id]`(장소 상세: 이름·카테고리·주소·지도 + 이 장소가 등장한 공개 코스 목록·평균 평점·방문 수) +
`/places`(카테고리/지역별 디렉터리). place는 커플 간 공유 레퍼런스라 **한 place에 여러 커플의 공개 방문이 모인다** →
자연스럽게 집계 콘텐츠가 쌓임.
- **사용자가치:** "이 카페 다른 커플들은 어땠지?" 자연 검색 유입("○○ 맛집 데이트").
- **AdSense·SEO:** 콘텐츠 볼륨 최대 축. place 수만큼 URL 증식. 내부 링크 그래프(코스↔장소) 강화.
- **난이도:** 중~상. 새 anon-safe 집계 뷰(`explore_places`, `explore_place_logs`) + web 페이지 2종.
- **의존성:** A 이후(코스 상세로 역링크). 지역 태깅(C)과 시너지.
- **프라이버시:** place 자체는 공개 레퍼런스라 안전. 집계는 **공개 로그만** 대상. 방문 커플 닉네임 노출 범위 open Q.

### C. 지역/카테고리 탐색 (검색 의도 캡처)
`/explore/지역/[region]`(예: 연남동), `/explore/카테고리/[category]`(예: 카페). 롱테일 검색어 캡처.
- **사용자가치:** 지역·테마 단위 탐색. "우리 동네 데이트 코스".
- **AdSense·SEO:** 롱테일 키워드 랜딩 페이지 대량 생성. 강력하나 콘텐츠가 얇으면 thin-content 리스크.
- **난이도:** 중. **지역 태깅 방식 결정 필요**(open Q: address 파싱 vs Kakao 지역코드 vs 수동).
- **의존성:** B(place 집계) + 지역 데이터. **A·B 안정 후.**
- **프라이버시:** 동(洞) 단위까지만 공개 권장(상세 주소 조합 + 경로 노출 시 위치 특정 위험).

### D. 큐레이션/정렬 (인기·최신)
explore·place 목록에 "인기 / 최신" 정렬. 인기 = 조회수 또는 좋아요 신호 필요.
- **사용자가치:** 좋은 코스 먼저. 재방문 유도.
- **AdSense·SEO:** 체류·회유 개선(직접 URL 증식은 아님).
- **난이도:** 저(최신) ~ 중(인기 — 신호 저장 필요). open Q: 조회수/좋아요 도입 여부.
- **의존성:** 인기 정렬은 D의 신호 인프라 필요. 최신은 즉시 가능.
- **프라이버시:** 집계 카운트만. 개별 방문자 식별 저장 지양.

### E. SEO 기반공사 (A와 함께 초기 투입)
- `app/sitemap.ts` — 정적 페이지 + `explore_logs`(+ 추후 `explore_places`)에서 동적 URL 생성.
- `app/robots.ts` — 공개(`/`·`/explore`·`/places`·정책) allow, **보호 경로 전부 disallow**
  (`/logs`·`/logs/new`·`/map`·`/calendar`·`/profile`·`/couple`·`/login`·`/auth`) + sitemap 링크.
- **per-route OG** — 공개 코스/place 상세 `generateMetadata`에서 공개 커버 URL을 OG 이미지로. 커버 없으면 브랜드 기본 OG.
- **JSON-LD 구조화 데이터** — 코스=`ItemList`/`Article`, place=`LocalBusiness`/`Place` + `AggregateRating`.
- canonical URL, `metadataBase`(이미 있음) 활용.
- **난이도:** 저~중. 대부분 web 단독. **AdSense 심사 직접 기여도 높음.**
- **프라이버시:** sitemap·OG는 공개 표면만 포함. 보호 경로는 robots에서 차단.

### F. 서비스 자체 풍부화 (공개가치 우선, 로그인 기능 포함)
- **좋아요/반응** — 공개 코스에 하트. D의 인기 신호 겸용. (로그인 필요, 카운트는 공개.)
- **"이 코스 따라하기"** — 공개 코스를 내 초안으로 복제(copy-on-publish의 역방향). 재방문·전환 유도.
- **댓글** — 공개 코스 대화. ⚠️ 모더레이션 부담(open Q).
- **북마크/팔로우** — 마음에 든 코스·커플 저장.
- **난이도:** 중. **의존성:** A·B 안정 후. **프라이버시:** 반응/댓글은 공개 로그에만.

## 권장 로드맵

**Phase 1 — AdSense 심사 통과 최소 세트 (즉시 착수)**
1. **A. 공개 코스 상세 `/explore/[id]`** (anon-safe 뷰 기반) + explore 카드 링크 활성화 + **보안 백로그 정공 해결**.
2. **E. SEO 기반공사** (sitemap/robots/per-log OG/JSON-LD).
→ 결과: 공개 로그 수만큼 크롤 URL + 깊이 있는 콘텐츠 + SEO 신호 → **심사 신청 가능 상태.** 이어서 `03-adsense.md`.

**Phase 2 — 콘텐츠 볼륨 (심사 병행/직후)**
3. **B. place 공개 페이지 + 디렉터리** (집계 뷰 + `/places`, `/places/[id]`) + place↔코스 내부 링크.
4. **C. 지역/카테고리 탐색** (지역 태깅 방식 확정 후).

**Phase 3 — 깊이·재방문**
5. **D. 큐레이션(최신 즉시 / 인기 신호 도입 시)** + **F. 좋아요·코스 따라하기**(공개가치 우선순으로 취사).

> 초기에 A+E를 몰면 **적은 코드로 심사 조건이 빠르게 충족**된다(0006 뷰가 이미 라이브라 A는 뷰 1개 추가 수준).

## 데이터모델 (증분)

기존 `explore_logs`/`explore_log_places` 뷰 재사용. 신규(마이그레이션 `0007_public_detail_places`, public/test 미러 + SCHEMA.md 갱신):

- **(A, 선택) `explore_log_route`** — 공개 코스 상세에 경로선을 노출한다면 anon-safe 뷰로 `date_log_id + coordinates`
  제공(공개 로그 한정). **경로선 공개는 open Q** — 기본값은 마커만(뷰 불필요), 승인 시 뷰 추가.
- **(B) `explore_places`** — `place_id, kakao_place_id, name, category, address, lat, lng,
  public_log_count, avg_rating` (공개 로그에 등장한 place 집계). anon grant.
- **(B) `explore_place_logs`** — place_id로 그 장소가 등장한 공개 코스 목록(= `explore_log_places` join
  `explore_logs`의 안전 컬럼). anon grant.
- **(C) 지역** — `places.region` 파생(동/구 단위). **방식 open Q**(address 파싱 생성컬럼 vs Kakao 지역코드).
- **(D) 인기 신호** — `date_log_reactions` 또는 조회수 테이블. **도입 여부 open Q.** 도입 시 카운트만 anon 뷰 노출.
- base 테이블 변경: `date_logs`/`date_log_places`/`routes`의 **`to authenticated` public-select 정책 제거**
  (공개 열람은 뷰로 일원화 → memo 노출 갭 폐쇄). 커플 스코프 select 정책은 유지(본인 커플 `/logs/[id]` 동작).

## 화면 (신규/변경)
- **`/explore/[id]`** (신규, 공개) — 공개 코스 상세. 로그아웃=PublicShell, 로그인=AppShell.
- **`/explore`** (변경) — 카드 링크 활성화(→`/explore/[id]`), (Phase3) 최신/인기 정렬.
- **`/places`** (신규, 공개, Phase2) — place 디렉터리(카테고리/지역 필터).
- **`/places/[id]`** (신규, 공개, Phase2) — place 상세 + 공개 방문 코스 목록.
- **`/explore/지역/[region]`, `/explore/카테고리/[category]`** (신규, 공개, Phase2~3).
- 컴포넌트: 공개 상세 organism/template, PlaceCard·PlaceLogList, JSON-LD 헤드 컴포넌트, OG 이미지.

## 작업 분해 (역할)
- **db-dev** — `0007` 작성: (B) `explore_places`/`explore_place_logs` 집계 뷰 + grant, (선택) `explore_log_route`,
  (C 승인 시) `places.region` 파생, base 테이블 `to authenticated` public-select **제거**(보안 백로그 해결).
  public/test 미러 + SCHEMA.md 갱신. RLS-first.
- **schema-dev** — 필요 시 공개 읽기 모델/카테고리·지역 enum을 `@maps/shared`에 (대부분 read-only DTO라 최소).
- **web-dev** — Phase1: `/explore/[id]`(뷰 기반, 마커) + 카드 링크 + `app/sitemap.ts` + `app/robots.ts` +
  per-log `generateMetadata`(OG) + JSON-LD. Phase2: `/places`·`/places/[id]` + place↔코스 링크. Phase3: 정렬·반응.
- **designer** — 공개 상세/place 페이지 template·비주얼(warm), 기본 OG 이미지, 필요 토큰.
- **dba** — `0007` 라이브 적용, 집계 뷰 인덱스(`place_id`, `visibility,date`), anon이 새 뷰는 읽고 base 테이블은
  못 읽음 검증(memo 갭 폐쇄 재확인).
- **reviewer / uiux-reviewer / build-qa** — 프라이버시(memo/갤러리/route 비노출) · 반응형/접근성 · 크롤/OG/sitemap 검증.

## 완료 기준
- 로그아웃으로 `/explore` 카드 클릭 → `/explore/[id]` 공개 상세 열람(memo·갤러리·private cover 비노출).
- 로그인 유저가 남의 공개 로그 상세를 열어도 memo 접근 불가(백로그 폐쇄, base 테이블 광역 정책 제거 확인).
- `sitemap.xml`이 공개 URL(정적 + 공개 코스)을 나열, `robots.txt`가 보호 경로 차단 + sitemap 링크.
- 공개 코스 상세에 per-log OG(공개 커버) + JSON-LD 렌더.
- (Phase2) `/places/[id]`에서 해당 장소의 공개 방문 코스 목록·평균 평점 열람.
- build-qa 게이트 + uiux-reviewer 패스.

## 열린 질문 (사용자 결정 필요)
1. **place 공개 디렉터리(B)까지 이번에 갈지** — Phase1(A+E)만으로 심사 시도 후 B는 병행/직후? 아니면 처음부터 B 포함?
2. **작성자/커플 표시명 공개 범위** — 공개 표면에 실제 닉네임 노출 vs "익명 커플"류 익명화(현재 explore는 닉네임 노출).
   크롤·검색에 실명/닉네임이 걸린다는 점 고려.
3. **경로선(route polyline) 공개 여부** — 공개 상세에 실제 이동 경로선을 그릴지, 아니면 방문 장소 마커만 표시할지.
   경로선+주소 조합은 위치 특정 위험 → 기본값은 마커만 제안.
4. **지역 태깅 방식(C)** — `places.address` 자동 파싱(동/구) vs Kakao 지역코드 vs 사용자 수동 태깅. 공개 노출 단위(동까지?).
5. **인기 신호/좋아요/조회수(D·F) 도입 여부** — 인기 정렬·하트를 위해 반응/조회 테이블을 둘지, 초기엔 최신 정렬만 갈지.
6. **댓글(F)** — 공개 코스 댓글을 열지(모더레이션·스팸 부담) 아니면 보류.
7. **"코스 따라하기"(F)** — 공개 코스를 내 초안으로 복제하는 기능 우선순위.

## 03-adsense.md 와의 관계
Phase1(A+E) 완료 = 03의 실질 선행조건 충족(공개 URL 다수 + 콘텐츠 깊이 + SEO). 이후 03의
ads.txt/스크립트/AdUnit(공개 페이지 한정)/신청/CMP로 이어간다. 로그인 후 사적 기록/작성 화면엔 광고 금지 원칙 유지.
</content>
</invoke>
