---
status: todo
last-updated: 2026-07-12
owner: planner
---

# 웹 성능 최적화 — 감사 결과 & 실행 계획

> 웹 성능 감사(perf audit) 완료본을 계획서로 정리한 문서. 기술 내용은 감사 원문을 왜곡 없이 보존.
> 연관: `docs/plan/11-profile-editing.md`(web-dev가 현재 아바타 배선 중 — **파일 충돌 주의**, 아래 STEP 착수 조건 참고), `supabase/SCHEMA.md`(뷰/인덱스), `docs/plan/03-adsense.md`(AdSense 로더 우선도).

## 배경 / 측정 상태
- 공개 표면(랜딩·explore·places·regions) 구조는 완성됐으나 **캐시 0·이미지 최적화 0·폰트 렌더 블로킹**이 겹쳐 FCP/LCP/TTFB에 구조적 손실이 있다.
- **실측 없음.** 효과 추정치는 전부 구조 기반 추론이며, **적용 전후 Vercel Speed Insights 또는 `curl` TTFB 기록을 권고**(측정은 대시보드/사용자 필요 — Blocked 성격, 아래 열린 질문).
- 확실성 등급: "확실"(코드 근거로 단정) vs "가설"(측정/설정 확인 필요, 단정 안 함)을 표에 명시.

## 우선순위표

| # | 항목 | 우선순위 | 예상 효과 | 난이도 | 확실성 |
|---|---|---|---|---|---|
| 1 | Pretendard를 jsDelivr CDN `@import`로 로드 — 렌더 블로킹 체인 | High | 전 페이지 FCP/LCP 수백 ms | 낮음 | 확실 |
| 2 | 공개 표면 데이터 페칭에 캐시 0 — 매 요청 Supabase 왕복 | High | 공개 페이지 TTFB 대폭 개선 | 중간 | 확실 |
| 3 | next/image 전무 + 커버가 CSS background-image | High | 원본 풀사이즈 다운로드 제거, LCP/대역폭 | 중간 | 확실 |
| 4 | Vercel 함수 리전 ↔ Supabase 리전 정합 미확인 | High(잠재) | 워터폴과 곱해져 TTFB 수 배 | 낮음 | 가설 — 확인 필요 |
| 5 | 요청당 auth.getUser() 최대 3회 (middleware+page+AppShell) | Med-High | 로그인 사용자 TTFB (auth RTT×2 제거) | 낮음 | 확실 |
| 6 | 페이지 내 순차 await 워터폴 (홈 7회, logs/[id] 6회 직렬) | Med-High | 동적 페이지 TTFB 30–60% | 낮음 | 확실 |
| 7 | 홈 피드 date_logs 무제한 SELECT | Med | 데이터 증가 시 선형 악화 방지 | 낮음 | 확실 |
| 8 | BMJUA TTF 1.5MB (wordmark 3글자용) | Med | 첫 방문 1.5MB → 수 KB | 낮음 | 확실 |
| 9 | AppShell이 아바타 조회 완료까지 본문 스트리밍 차단 | Med | 로그인 페이지 체감 렌더 | 낮음 | 확실 |
| 10 | generateMetadata ↔ page 중복 페칭 | Low-Med | 상세페이지 DB 왕복 절반 | 낮음 | 부분 가설 |
| 11 | 갤러리/썸네일 img lazy·dimensions 없음 → CLS/대역폭 | Low-Med | CLS, 하단 이미지 대역폭 | 낮음 | 확실 |
| 12 | sitemap.xml 매 히트마다 3개 뷰 풀스캔 | Low | 크롤러 트래픽 시 DB 부하 | 낮음 | 확실 |
| 13 | 미들웨어 익명 요청 fast-path 없음 | Low | 익명은 로컬 실패라 영향 작음 | 낮음 | 확실 |
| 14 | DB: explore_places 집계 뷰 매 요청 계산 / region 미인덱스 | Low(현재) | 규모 커지면 Med | dba 몫 | 확실 |
| 15 | 미사용 deps(axios, zustand) / 미사용 TTF 4종(5.5MB) | Low | 위생 | 낮음 | 확실 |

## 상세 (감사 원문 보존)

### 1. Pretendard CDN @import (High)
근거: `apps/web/src/app/globals.css:1` — jsDelivr `pretendardvariable-dynamic-subset.css`를 CSS `@import`. 컴파일된 앱 CSS 안에 외부 @import가 남아 직렬 체인(앱 CSS → jsDelivr CSS → woff2) 발생, 전 페이지 본문 텍스트(랜딩 LCP는 텍스트)가 이 체인 뒤. `@latest` 태그라 버전 미고정. 개선(택1): ① `next/font/local`로 Pretendard self-host — `fonts.ts` 추가, html className에 variable 연결, Tailwind `sans`를 `var(--font-pretendard)`로. preload+size-adjust 자동. ② 최소수정: @import 제거 → layout head에 preconnect + 버전 고정 link. **권장 ①(self-host)** — 배민 폰트 self-host 선례와 일관.

### 2. 공개 표면 캐시 부재 (High)
근거: `revalidate`/`unstable_cache`/`use cache` 사용처 0건. 공개 페이지 전부 `createClient()`(cookies) + getUser() 때문에 dynamic — `/` page.tsx:50-58, `/explore` page.tsx:12-16, `/places` page.tsx:24-31(explore_places 전건), `/explore/[id]`, `/places/[id]`, regions 동일. 예외(/guide,/faq,/privacy,/terms는 정적, 양호). 개선: 공개 뷰는 anon/auth 동일 결과(뷰 자체 where visibility='public', RLS 아님 — SCHEMA.md 확인)이므로 쿠키 무관 → `src/lib/supabase/anon.ts`에 @supabase/supabase-js 모듈 레벨 싱글턴 → `lib/explore.ts`·`lib/places.ts`·`lib/regions.ts` fetcher가 사용 → 각 fetcher를 `unstable_cache(fn,[key],{revalidate:120,tags:['explore']})`로. 발행/수정 시 revalidateTag('explore') 또는 시간 기반만.

### 3. 이미지 최적화 부재 (High)
근거: next/image 0건, next.config.mjs images 설정 없음. 커버가 CSS 배경(`DateLogCard.tsx:24-27`, `CoverHero.tsx:22-25`) — Storage 원본 그대로, 프리로드 스캐너 미포착, 상세페이지 LCP가 이 커버. `PhotoGallery.tsx:18`/`PhotoThumb.tsx:12`/`AvatarImage.tsx:26` raw img, lazy/dimensions 없음. 개선: next.config.mjs `images.remotePatterns`(supabase.co /storage/v1/object/**) 추가; public-covers는 next/image fill+sizes 전환(상세 CoverHero는 priority); date-photos(서명 URL)는 주의 — 토큰 변동 시 /_next/image 캐시 키 변동으로 매번 재최적화 → (a) 서명 만료 장기화+시각 버킷팅 (b) Supabase image transformation(유료, 플랜 확인 필요) (c) 최소 lazy+decoding+width/height.

### 4. Vercel 리전 (High 잠재, 가설)
vercel.json 없음. 기본 iad1 vs Supabase 서울 가능성 — 왕복당 ~150-200ms × 워터폴 6-7회. 대시보드에서 두 리전 확인, 불일치면 regions ["icn1"] 한 줄. 측정 전 단정 안 함. **→ 사용자/대시보드 필요(Blocked 성격).**

### 5. 요청당 getUser() 3회 (Med-High)
근거: `middleware.ts:62-64` + 각 page(예 page.tsx:51-53) + `AppShell.tsx:27-29`. 세션 있으면 매번 /auth/v1/user 네트워크 검증. 익명은 로컬 즉시 실패라 무관. 개선: `server.ts`에 `React.cache()` 감싼 getUser 헬퍼 → page/AppShell 공유로 렌더 패스 1회 확정. 미들웨어 분은 유지(쿠키 갱신). getClaims() 로컬 검증 격상은 asymmetric JWT 설정 확인 필요(가설).

### 6. 순차 await 워터폴 (Med-High)
근거: 홈 `page.tsx:51→79→86→99` + AppShell `28→33→43` 합계 최대 7 왕복 직렬, couples 조회 page/AppShell 중복. `/logs/[id]` page.tsx:54→59→79→85→94→107 6회 직렬(커버 서명·photos·profiles는 병렬 가능). 공개 페이지 getUser→데이터도 Promise.all 가능. 개선: Promise.all 패턴화 + getCouple도 React.cache로 공유.

### 7. 무제한 쿼리 (Med)
`page.tsx:86-91` date_logs 전체+중첩 embed, limit 없음 → .limit(20)+더보기. `map/page.tsx:19` date_log_places 전건. `places/page.tsx:31`은 칩 도출 겸용 의도적, 당장 OK.

### 8. BMJUA 1.5MB TTF (Med)
`src/fonts/BMJUA_ttf.ttf` 1,525,212B, 사용처 Logo "위로그" 3글자뿐인데 헤더 상시 → 전 첫방문 1.5MB. 개선: pyftsubset로 서브셋 woff2(수 KB) 또는 wordmark SVG 박제. 부수: 미사용 TTF 4종(합 5.5MB)은 번들 미포함이나 저장소 위생 정리 대상.

### 9. AppShell 스트리밍 차단 (Med)
`AppShell.tsx:61-62` await resolveAvatars()가 헤더+본문 HTML 송출 차단. 개선: 아바타를 async 자식 컴포넌트 + Suspense fallback으로 분리. (5·6 적용 시 우선도 하락.)

### 10. generateMetadata 중복 페칭 (Low-Med)
`explore/[id]/page.tsx:27+69`, `places/[id]/page.tsx:27,32+67,70`, `regions/[region]/page.tsx:25+66` 같은 fetcher 2회. React.cache()로 확정 dedupe. 2번 적용 시 자연 해소.

### 11~13
11: PhotoGallery lazy만으로도 절감. 12: sitemap.ts `export const revalidate = 3600`. 13: 미들웨어 익명 fast-path는 마이크로 수준 — 여유 시만. AdSense는 유닛 배치 전까지 lazyOnload로 낮춰도 무손실. Kakao SDK 온디맨드 로딩 이미 양호. 'use client' 경계 전반 양호(logs/new만 페이지 전체 client, 비공개 화면이라 허용).

### 14. DB (dba 전달용)
현 쿼리 패턴은 기존 인덱스로 커버. 갭 후보: (a) explore_places/explore_regions 매 요청 집계 — 캐시(2번)로 1차 방어, 규모 시 materialized view. (b) region 뷰-시점 파생식이라 eq 필터 인덱스 불가 — SCHEMA.md:190의 stored generated column+btree 격상 경로 그대로.

## STEP 분해 (권장 착수 순서 기반)

> ⚠️ **착수 조건:** 현재 web-dev가 `docs/plan/11-profile-editing.md`의 web STEP(AvatarUploader + `AppShell.tsx`/`profile/page.tsx` 배선)을 작업 중이다. 본 계획의 STEP B·C·D는 **`AppShell.tsx`·`server.ts`·이미지 컴포넌트를 건드려 11번과 충돌**하므로 **11번 web STEP 완료(reviewer/build-qa PASS) 후 착수**한다. STEP A(리전 확인)와 폰트(1·8)는 파일 겹침이 없어 선행 가능.

- **STEP A — 리전 확인 (사용자/대시보드, Blocked 성격):** Vercel 함수 리전 ↔ Supabase 리전(서울/icn1) 대조. 불일치면 `vercel.json` `regions:["icn1"]` 추가. 측정 없이 코드 착수 금지 — 이 확인이 High(4)의 게이트. → 열린 질문 1.
- **STEP B — 폰트 (web-dev, 11 무관 선행 가능):** ① Pretendard self-host(`next/font/local`, globals.css `@import` 제거, Tailwind `sans` 변수화). ⑧ BMJUA 서브셋 woff2 또는 wordmark SVG + 미사용 TTF 4종 정리. (파일 충돌 없음.)
- **STEP C — 페칭/캐시 (web-dev, 11 완료 후):** ② `lib/supabase/anon.ts` 싱글턴 + `lib/{explore,places,regions}.ts` fetcher `unstable_cache`(revalidate 120, tag 기반 무효화). ⑤ `server.ts` `React.cache()` getUser/getCouple 헬퍼(page/AppShell 공유). ⑥·⑩ Promise.all 워터폴 해소 + generateMetadata dedupe. **`AppShell.tsx`·`server.ts` 편집 = 11번 충돌 지점.**
- **STEP D — 이미지 (web-dev, 11 완료 후):** ③ `next.config.mjs images.remotePatterns` + public-covers next/image(fill+sizes, 상세 priority) + date-photos 서명 URL 처리(택1: 만료 장기화·image transformation·최소 lazy). ⑪ PhotoGallery/PhotoThumb lazy+width/height. `AvatarImage.tsx`는 11번과 겹칠 수 있어 조정 필요.
- **STEP E — 잔여 (web-dev):** ⑦ 홈 date_logs `.limit(20)`+더보기, map 전건 검토. ⑨ AppShell 아바타 Suspense 분리(5·6 후 우선도↓). ⑫ sitemap `revalidate=3600`. ⑬ 미들웨어 fast-path(여유 시). ⑮ 미사용 deps(axios/zustand) 제거.
- **STEP F — DB (dba, 규모 후):** ⑭ 캐시(STEP C)로 1차 방어 후 규모 시 explore_places materialized view + region stored generated column + btree(SCHEMA.md:190 경로). 현재 인덱스로 커버되어 급하지 않음.
- **측정 (STEP 전후, 사용자/대시보드):** 각 STEP 전후 Vercel Speed Insights 또는 `curl` TTFB 기록 — 효과 검증. 실측 인프라는 대시보드 필요(Blocked 성격).

## 완료 기준
- [ ] STEP A 리전 정합 확인·필요 시 `vercel.json` 반영.
- [ ] Pretendard self-host + BMJUA 서브셋, 렌더 블로킹 체인 제거.
- [ ] 공개 표면 fetcher 캐시(unstable_cache) + anon 싱글턴, getUser/getCouple React.cache 공유.
- [ ] next/image 배선(remotePatterns + 커버/썸네일 전환).
- [ ] typecheck/lint/web build PASS, 회귀 없음, 적용 전후 TTFB 기록.

## 열린 질문 (Blocked 성격 표기)
1. **리전(4) — 사용자/대시보드 필요.** Vercel 함수 리전과 Supabase 리전 확인은 planner가 코드로 못 함. 불일치 시 `vercel.json` 반영. **측정 전 단정 금지.**
2. **Speed Insights 실측 — 대시보드 필요.** 현재 실측 데이터 없음, 효과 전부 구조 추론. 전후 기록으로 검증 권장.
3. **date-photos next/image 전략(3) — 플랜 확인 필요.** Supabase image transformation은 유료 → 플랜 확인 후 (a)만료 장기화 (b)transformation (c)최소 lazy 중 택. 미확인 시 (c) 안전 기본.
4. **AdSense 로더 lazyOnload 격하(11~13)** — 유닛 배치 전까지 무손실이나, 03 STEP2 승인/배치 전이라 지금 손대도 회귀 위험 낮음. 여유 시.
