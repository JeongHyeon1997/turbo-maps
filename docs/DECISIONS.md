# DECISIONS — 경량 ADR

되돌리기 어려운 결정과 근거만 기록. 새 결정은 위에 추가(최신순).

## 2026-07-06 · 공개 표면(랜딩)
- **`/` 하나로 랜딩+피드 처리** — 라우트를 `/feed`로 분리하지 않고, `/`가 세션 유무로 분기(비로그인=마케팅 랜딩, 로그인=기존 피드). 이유: 기존 링크·미들웨어·북마크 파괴 없이 공개 표면 확보. 미들웨어에선 `/`(정확 일치)·`/privacy`·`/terms`만 public 추가하고 하위 보호 경로는 유지.
- **공개 커버 사진 = 별도 public 버킷 `public-covers` + 공개 시 복사(copy-on-publish)** — 후보 (a)public 버킷 복사 / (b)장기 서명 URL / (c)private 버킷 storage RLS로 anon 읽기 허용 중 **(a) 채택.**
  - **근거**: crawlable·안정적인 `<img src>`(무토큰 공개 URL)는 **public 버킷에서만** 가능 → AdSense 심사·OG 이미지·anon 렌더에 필수. (b)는 만료·개별 폐기 불가·서명 지연·크롤 불가로 부적합. (c)는 path→date_log 매핑 서브쿼리가 매 객체마다 필요하고, private 버킷은 무토큰 `<img>` 로드가 안 돼 결국 서명/프록시가 또 필요 → 목적 미달.
  - **프라이버시**: 사적 원본(`date-photos`)은 **절대 건드리지 않는다.** 공개는 "명시적·되돌릴 수 있는 복사본"만 `public-covers`에 만든다. 비공개 전환/삭제 시 공개 복사본만 지우면 완전 원복(원본 무손상) → 되돌림 가능성 최상.
  - **비용/복잡도**: 중복 저장은 "공개로 설정된 로그의 커버 1장"뿐(소수) → 비용 미미. 복사/정리 로직만 추가.
  - **범위**: 공개하는 것은 **커버 1장만.** `date_log_photos` 갤러리는 공개 로그여도 커플 전용 유지(기존 결정 계승). 갤러리는 이번에 public화하지 않는다.
  - **쓰기 경로**: `public-covers`도 동일 패턴 storage RLS(authenticated는 본인 `<uid>/…`만 write/delete, **SELECT는 anyone/public**). 사용자 세션으로 private→public 복사 → service_role 불필요.
- **공개 explore의 사적 필드 비노출** — `date_logs`의 `memo`는 RLS row 정책만으로는 컬럼 숨김이 안 됨 → anon에는 **안전 컬럼만 노출하는 뷰**(`explore_logs`: id·title·date·public_cover_path·표시명)로 제공하고 anon의 date_logs 직접 select는 막는다(또는 최소 anon 정책 + 앱 컬럼 프로젝션). db-dev가 뷰 방식으로 구현.

## 2026-07-05 · 초기 세팅
- **모노레포 구조**를 morun에서 복제 → 검증된 Bun+Turborepo 설정 재사용, 커플 도메인으로 정리. (러닝 도메인 코드는 전부 제거)
- **지도: Kakao Map** — 국내 장소/길찾기 데이터 정확도. web/mobile JS 키 + api REST 키 구조.
- **Supabase 재사용** — 신규 프로젝트 `giilijttitajvygdosbe`. public/test 두 스키마 패턴 유지.
- **디자인 방향: warm/personal** — Notion/Airbnb/Clay 참고(awesome-design-md). 크림+코랄.
- **역할 9개 + 자동 위임** — planner/designer=Opus, reviewer=Opus, 구현/QA=Sonnet.
- **docs 이어가기 프로토콜** — PROGRESS.md 4구획 + 진전마다 커밋. 세션 단절 대비.
