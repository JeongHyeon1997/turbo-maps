---
status: todo
last-updated: 2026-07-06
owner: planner
---

# Google AdSense 도입 계획

## 목표
web(maps.weourus.xyz)에 AdSense 광고를 붙여 수익화. **신청은 사용자가 진행**, 코드/페이지 준비는 여기서.

## ⚠️ 승인 전 반드시 알아야 할 것
AdSense는 "**공개적으로 접근 가능한, 가치 있는 콘텐츠**"를 요구한다. 우리 앱은 **로그인 벽**이라 크롤 가능한 콘텐츠가 거의 없어 **그대로는 승인 어려움**. 그래서 공개 표면을 먼저 만들어야 한다:

1. **공개 랜딩(`/`)** — 로그인 전에도 서비스 소개가 보이는 마케팅 페이지 (현재는 즉시 /login으로 튕김 → 분리 필요).
2. **공개 탐색(`/explore`)** — 지금은 로그인 필요. AdSense용으로 **비로그인도 열람 가능**하게 열지 검토 (anon 읽기 RLS + places anon select 필요). 공개 데이트 코스가 실질 콘텐츠가 됨.
3. **개인정보처리방침(`/privacy`)·이용약관(`/terms`)** — AdSense 필수(쿠키/광고 고지 포함).
4. 충분한 페이지 수/콘텐츠 — 랜딩+explore+정책 페이지 최소 구성.

## 구현 단계 (승인 후/전)
1. **소유권 확인** — `apps/web/public/ads.txt`에 `google.com, pub-XXXX, DIRECT, f08c47fec0942fa0` + AdSense가 주는 verification `<meta>` 또는 스니펫.
2. **스크립트 로드** — `next/script`(strategy afterInteractive)로 `pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXX`. env `NEXT_PUBLIC_ADSENSE_CLIENT`.
3. **AdUnit 컴포넌트** (atom/molecule) — `<ins class="adsbygoogle" ...>` + `(adsbygoogle=window.adsbygoogle||[]).push({})`. 재사용.
4. **배치** — 공개 랜딩/`/explore`/(공개)상세에만. **로그인 후 개인 기록·작성 화면엔 광고 금지**(사적 공간 + 정책 리스크). 자동광고보다 수동 배치 권장.
5. **동의(CMP)** — 한국/EU 대상 개인화 광고엔 동의 관리 필요. Google 인증 CMP 또는 Consent Mode v2 연동.

## 프라이버시/정책 주의
- 커플의 사적 기록 페이지엔 광고 X. 광고는 공개 콘텐츠에 한정.
- 개인정보처리방침에 애드센스 쿠키/제3자 광고 고지 필수.

## 선행 의존성
- 공개 랜딩 분리 + `/explore` 공개화(RLS anon) 결정 → 이게 없으면 승인 자체가 어려움.
- 담당: planner(정책 문구·공개 범위 결정) · web-dev(랜딩/정책/AdUnit) · db-dev(anon 공개 RLS, 필요 시).

## 추천 순서
1. 공개 랜딩 + /privacy + /terms
2. /explore 공개 열람(선택)
3. ads.txt + 스크립트 + AdUnit(공개 페이지)
4. (신청·승인) → 동의(CMP)
