---
status: doing
last-updated: 2026-07-06
owner: planner
---

# 공개 표면(Public Surface) — 랜딩 + 정책 페이지 + explore 공개화 + 공개 커버

## 배경 / 왜 지금
- 현재 앱은 **완전한 로그인 벽**이다: 비로그인은 `/`를 포함한 모든 경로에서 `/login`으로 튕긴다(`middleware.ts`의 `PUBLIC_PREFIXES = ['/login','/auth']`).
- 그 결과 (1) 크롤 가능한 콘텐츠가 없어 **AdSense 승인 불가**, (2) 첫 방문자가 서비스가 뭔지 보지도 못하고, (3) SEO/공유 시 보여줄 공개 페이지가 없다.
- 이 계획은 **AdSense(03) 승인의 선행 조건**이자, 그 자체로 첫인상·SEO 가치를 준다. **전부 지금 바로 코드로 진행 가능**(신청·승인만 사용자).

## 목표
비로그인 방문자에게 보이는 **가치 있는 공개 표면**을 만든다: 마케팅 랜딩 + 정책 페이지 + (선택) 공개 데이트 코스 열람 + 공개 커버 사진.

## 사용자 스토리
- 비로그인 방문자로서, `/`에서 We Log가 무엇인지·왜 쓰는지 이해하고 로그인 CTA를 누른다.
- 비로그인 방문자로서, `/explore`에서 공개된 데이트 코스(사진·장소)를 둘러본다.
- 사용자로서, `/privacy`·`/terms`에서 데이터·광고 쿠키 정책을 확인한다.

## 단계 (의존성 순서)

### 1단계 — 공개 랜딩 + 정책 페이지 (지금 바로 착수) 🎯
- **미들웨어**: `PUBLIC_PREFIXES`에 `/`(정확히 일치), `/privacy`, `/terms` 추가. `/`는 정확히 일치할 때만 public(하위 경로는 보호 유지). explore 공개화는 2단계에서.
- **랜딩 `/`**: `/` 하나로 처리 — 서버 컴포넌트에서 세션 확인 → **로그인 시 기존 피드**, **비로그인 시 마케팅 랜딩**. (라우트 이동 없음. DECISIONS 참고)
  - 랜딩 섹션: 히어로(가치 제안 + 로그인 CTA) · 기능 소개(기록/지도/경로/함께 되돌아보기) · 공개 코스 미리보기(explore 발췌) · 푸터(정책 링크).
- **정책 페이지**: `/privacy`(개인정보처리방침 — 수집 항목/이용/보관, **AdSense 쿠키·제3자 광고 고지 포함**), `/terms`(이용약관). 초안 문구는 planner가 작성해 전달.
- 담당: **web-dev**(미들웨어·랜딩·정책 페이지, atoms/molecules/organisms/template) · **designer**(히어로 비주얼·warm 방향·필요 토큰) · planner(정책 문구 초안).

### 2단계 — /explore 공개 열람 + 공개 커버 사진 (status: doing · 2026-07-06)

**ADR 확정**(DECISIONS.md 2026-07-06): 공개 커버 = 별도 **public 버킷 `public-covers` + copy-on-publish**. 갤러리는 커플 전용 유지(커버 1장만 공개). 사적 필드는 anon 안전 뷰로 비노출.

#### db-dev — 마이그레이션 `0006_public_explore.sql` (public/test 미러 + SCHEMA.md 갱신)
1. **public 버킷 생성**: `public-covers` (public read = true). 글로벌(스키마 미러 아님, storage는 전역).
2. **storage RLS (`public-covers`)**: authenticated는 본인 `<uid>/…` 폴더에만 INSERT/UPDATE/DELETE. **SELECT는 anyone(public)** — 무토큰 공개 읽기.
3. **`date_logs.public_cover_path text` 컬럼 추가**(nullable) — 공개 복사본의 `public-covers` 내 경로. private/커버없음이면 null. public/test 양쪽.
4. **anon 읽기 허용**: 기존 `0004_visibility`의 public-select 정책들(`date_logs`/`date_log_places`/`routes`, `visibility='public'`)이 **`anon` role에도 적용**되는지 확인. `TO authenticated`로만 돼 있으면 `TO anon, authenticated`로 확장(또는 anon 전용 정책 추가). 확장 시 사적 필드 노출 주의(아래 5).
5. **사적 필드 비노출 뷰**: anon에 date_logs 전체 컬럼(특히 `memo`)이 열리지 않게 — 안전 컬럼만 노출하는 뷰 `explore_logs` 생성(id·couple_id·title·date·public_cover_path·created_at + 필요한 표시명), `grant select on explore_logs to anon`. anon의 base `date_logs` 직접 select는 열지 않는다(뷰만 anon 대상). `date_log_places`/`routes`는 사적 컬럼 없음 → anon select 허용 유지.
   - (표시명) 공개 로그의 작성자/커플 닉네임을 anon에 보여줄지 결정: 필요 시 뷰에 join된 닉네임만 포함, `profiles` 원테이블은 anon 비노출 유지.
6. SCHEMA.md의 Storage 섹션·`date_logs` 컬럼·RLS 섹션 갱신.

#### web-dev
- **미들웨어**: `PUBLIC_PREFIXES`에 `/explore`(및 하위) 추가.
- **/explore**: 데이터 조회를 anon 뷰(`explore_logs`) 기반으로 전환. 커버는 `public_cover_path`가 있으면 **public 버킷 공개 URL**(`/storage/v1/object/public/public-covers/<path>`)로 렌더, 없으면 기존 그라데이션 폴백. 로그인/비로그인 모두 동작.
- **랜딩 ExplorePreview**: 실제 공개 데이터 발췌 + 공개 커버 렌더.
- **copy-on-publish**: 로그 생성/수정에서 `visibility='public'`이고 커버가 있으면 원본을 `public-covers/<uid>/…`로 복사하고 `public_cover_path` 저장. `private`로 전환/커버 삭제/로그 삭제 시 공개 복사본 삭제 + `public_cover_path` null. best-effort + 실패 로깅.
- **OG 이미지**: 공개 상세/랜딩의 OG에 public 커버 URL 사용(선택).

#### 라이브 적용 (⚠️ 사용자 승인 필요)
`0006` DDL·스토리지 정책은 **라이브 변경 → auto-mode 차단**. 사용자가 SQL Editor 붙여넣기 또는 `SBP_TOKEN=sbp_... bun scripts/mgmt-apply.ts supabase/migrations/0006_public_explore.sql`. **0005도 아직 미적용(Blocked)** → 함께 적용 요청. 적용 전엔 explore 공개 조회/공개 커버가 동작하지 않음.

- 담당: **db-dev**(0006 작성) · **dba**(라이브 적용·인덱스) · **web-dev**(미들웨어·explore·copy-on-publish·렌더) · planner(ADR, 완료).

## 완료 기준
- 비로그인 상태로 `/`·`/privacy`·`/terms` 접근 가능하고 콘텐츠가 렌더된다(로그인으로 안 튕김).
- 로그인 상태에서 `/`는 기존 피드 그대로.
- (2단계) 비로그인으로 `/explore`에서 공개 코스+커버 사진 열람 가능, 사적 필드 비노출.
- build-qa 게이트 통과 + uiux-reviewer 반응형/접근성 패스.

## AdSense(03)와의 관계
이 계획 1~2단계 = 03-adsense.md의 "선행 의존성". 완료 후 03의 ads.txt/스크립트/AdUnit/신청으로 이어간다.
</content>
</invoke>
