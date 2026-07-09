---
status: doing
last-updated: 2026-07-07
owner: planner
---

# Google AdSense 도입 계획

## 목표
web(maps.weourus.xyz)에 AdSense 광고를 붙여 수익화. **신청은 사용자가 진행**, 코드/페이지 준비는 여기서.

## 선행조건 — 현재 상태 (2026-07-07)
AdSense는 "**공개적으로 접근 가능한, 가치 있는 콘텐츠**"를 요구한다. 로그인 벽 문제를 풀기 위한 공개 표면은 **거의 완성**됨:

- [x] **공개 랜딩 `/`** — 비로그인 마케팅 페이지 (세션 분기). 라이브.
- [x] **개인정보처리방침 `/privacy` · 이용약관 `/terms`** — 쿠키/제3자 광고 고지 포함. 라이브.
- [x] **공개 탐색 `/explore` + 공개 코스 상세 `/explore/[id]`** — anon 열람 가능(anon-safe 뷰). 라이브.
- [x] **장소 공개 페이지 `/places/[id]` + 디렉터리 `/places`** — place 축 공개 표면. 라이브.
- [x] **SEO 기반공사** — `sitemap.ts`·`robots.ts`·per-log/per-place OG·JSON-LD. 라이브.
- [ ] **⚠️ 실제 공개 콘텐츠(공개 로그) — 미충족.** 현재 공개 뷰가 전부 `[]`(공개 로그 0건). 심사에 가장 치명적.

> **결론:** 기술 기반은 다 깔렸다. **남은 단 하나의 실질 blocker는 "실제 공개 데이터"**다. thin/empty content 상태로 신청하면 거의 확실히 반려된다.

## STEP 0 (선행·사용자 작업) — 실공개 로그 확보 ★ 여기부터
AdSense 신청 전에 반드시 선행. **커플 실테스트를 겸해** 실제 공개 데이터를 쌓는다.
- [ ] 커플 2계정 연결(초대코드) — PROGRESS `## 다음`의 커플 실테스트와 겸함.
- [ ] **공개 데이트 코스 최소 8~15건 작성**(공개 토글 ON, 커버 사진 포함). 장소·평점·설명이 실제로 채워진 것.
      - 목표: `/explore`·`/explore/[id]`·`/places`·`/places/[id]`가 **빈 화면이 아니게** 만든다.
      - 여러 장소·여러 카테고리에 분산되면 `/places` 디렉터리도 콘텐츠가 생긴다.
- [ ] 작성 후 크롤 대상 URL이 실제로 200 + 콘텐츠 렌더 확인(익명·memo 비노출 유지되는지도 확인).
- [ ] (선택) 랜딩/정책 카피 오탈자·"about"성 설명 보강해 페이지 품질 올림.
- **담당:** 사용자(콘텐츠 작성) + reviewer/build-qa(공개 URL 렌더·비노출 검증).

## STEP 1 (착수, 다음 세션이 바로 실행) — 코드/페이지 준비
STEP 0로 실데이터가 어느 정도 쌓인 뒤 착수. **발급된 publisher id: `ca-pub-5362531643629275`.**
1. [x] **소유권 확인 파일** — `apps/web/public/ads.txt` 생성됨:
       `google.com, pub-5362531643629275, DIRECT, f08c47fec0942fa0`.
       (신청 단계에서 AdSense가 주는 verification `<meta>`/스니펫은 그때 추가.)
2. [x] **스크립트 로드** — `src/lib/adsense.tsx`의 `<AdSenseScript>`(`next/script`, `afterInteractive`)를
       **`PublicShell`에만** 마운트(공개 표면 전용 → 로그인 AppShell 사적 화면엔 미로드). env
       `NEXT_PUBLIC_ADSENSE_CLIENT`(미설정 시 렌더 안 함 → graceful). **⚠️ 프로덕션 반영엔 Vercel env에
       `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-5362531643629275` 설정 필요**(PROGRESS Blocked 참고).
3. [ ] **AdUnit 컴포넌트**(atom/molecule) — `<ins class="adsbygoogle" .../>` + `(adsbygoogle=window.adsbygoogle||[]).push({})`.
       토큰 사용·재사용. env 없으면 렌더 스킵. **승인 후 발급되는 slot id 필요 → STEP 2 이후.**
4. [ ] **배치(공개 페이지 한정)** — `/`(랜딩)·`/explore`·`/explore/[id]`·`/places`·`/places/[id]`에만.
       **로그인 후 개인 기록·작성·프로필 화면엔 광고 절대 금지**(사적 공간 + 정책 리스크). 자동광고보다 수동 배치.
5. [ ] **동의(CMP / Consent Mode v2)** — 한국/EU 개인화 광고 동의 관리. Google 인증 CMP 또는 Consent Mode v2 연동.
       `/privacy`의 쿠키·제3자 광고 고지와 문구 일치시키기.

## STEP 2 (신청·승인) — 사용자 작업
- [ ] AdSense 계정 생성 + 사이트 `maps.weourus.xyz` 등록 → pub-id 발급.
- [ ] STEP 1의 ads.txt/스크립트 배포 후 심사 제출.
- [ ] 승인 후 AdUnit slot id 발급받아 env/컴포넌트에 반영, CMP 최종 점검.

## 원칙 (변하지 않음)
- 광고는 **공개 콘텐츠에만.** 커플의 사적 기록/작성/프로필 페이지엔 절대 X.
- 작성자·memo·갤러리·경로선·실명은 공개 표면에 노출 안 됨(이미 뷰로 구조적 차단).
- `/privacy`에 애드센스 쿠키/제3자 광고 고지 유지·CMP 문구와 일치.

## 담당
- planner: 정책 문구·배치 범위 확정 · web-dev: ads.txt/스크립트/AdUnit/배치/CMP · reviewer·build-qa: 사적 화면 광고 부재·공개 렌더 검증 · 사용자: STEP 0 콘텐츠 + STEP 2 신청.
