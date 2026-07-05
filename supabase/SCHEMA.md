# SCHEMA.md — rolled-up DB state (source of truth)

> Read this to know the current schema/RLS. **Don't** grep migrations to reconstruct state.
> Every new migration MUST update this file in the same commit (enforced by `rls-migration`).

**Project:** `giilijttitajvygdosbe` · **Schemas:** `public` (prod), `test` (test data) — kept in sync.

## Status: clean slate

No tables yet. The first migration is authored by `db-dev` from the data model in `docs/plan/` once the planner defines it.

### Planned entities (not yet migrated — see docs/plan)

| Entity | Purpose |
| --- | --- |
| `profiles` | 유저 프로필 (auth.users 1:1) |
| `couples` | 두 유저를 잇는 커플 단위 |
| `places` | 방문 장소 (Kakao place id 기준) |
| `date_logs` | 하루 데이트 기록 (couple 귀속) |
| `date_log_places` | date_log ↔ place (방문 순서/평점/메모) |
| `routes` | date_log의 이동 경로 (좌표 시퀀스) |

## Tables

_(none yet)_

## RLS policies

_(none yet)_
