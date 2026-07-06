# DECISIONS — 경량 ADR

되돌리기 어려운 결정과 근거만 기록. 새 결정은 위에 추가(최신순).

## 2026-07-06 · 공개 표면(랜딩)
- **`/` 하나로 랜딩+피드 처리** — 라우트를 `/feed`로 분리하지 않고, `/`가 세션 유무로 분기(비로그인=마케팅 랜딩, 로그인=기존 피드). 이유: 기존 링크·미들웨어·북마크 파괴 없이 공개 표면 확보. 미들웨어에선 `/`(정확 일치)·`/privacy`·`/terms`만 public 추가하고 하위 보호 경로는 유지.
- (보류) **공개 커버 사진 스토리지 정책** — 별도 public 버킷 vs 장기 서명 URL vs 공개 동의 플래그. 2단계 착수 시 확정 예정(되돌리기 어려운 스토리지 구조).

## 2026-07-05 · 초기 세팅
- **모노레포 구조**를 morun에서 복제 → 검증된 Bun+Turborepo 설정 재사용, 커플 도메인으로 정리. (러닝 도메인 코드는 전부 제거)
- **지도: Kakao Map** — 국내 장소/길찾기 데이터 정확도. web/mobile JS 키 + api REST 키 구조.
- **Supabase 재사용** — 신규 프로젝트 `giilijttitajvygdosbe`. public/test 두 스키마 패턴 유지.
- **디자인 방향: warm/personal** — Notion/Airbnb/Clay 참고(awesome-design-md). 크림+코랄.
- **역할 9개 + 자동 위임** — planner/designer=Opus, reviewer=Opus, 구현/QA=Sonnet.
- **docs 이어가기 프로토콜** — PROGRESS.md 4구획 + 진전마다 커밋. 세션 단절 대비.
