# DECISIONS — 경량 ADR

되돌리기 어려운 결정과 근거만 기록. 새 결정은 위에 추가(최신순).

## 2026-07-05 · 초기 세팅
- **모노레포 구조**를 morun에서 복제 → 검증된 Bun+Turborepo 설정 재사용, 커플 도메인으로 정리. (러닝 도메인 코드는 전부 제거)
- **지도: Kakao Map** — 국내 장소/길찾기 데이터 정확도. web/mobile JS 키 + api REST 키 구조.
- **Supabase 재사용** — 신규 프로젝트 `giilijttitajvygdosbe`. public/test 두 스키마 패턴 유지.
- **디자인 방향: warm/personal** — Notion/Airbnb/Clay 참고(awesome-design-md). 크림+코랄.
- **역할 9개 + 자동 위임** — planner/designer=Opus, reviewer=Opus, 구현/QA=Sonnet.
- **docs 이어가기 프로토콜** — PROGRESS.md 4구획 + 진전마다 커밋. 세션 단절 대비.
