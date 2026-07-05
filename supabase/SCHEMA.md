# SCHEMA.md — rolled-up DB state (source of truth)

> Read this to know the current schema/RLS. **Don't** grep migrations to reconstruct state.
> Every new migration MUST update this file in the same commit (enforced by `rls-migration`).

**Project:** `giilijttitajvygdosbe` · **Schemas:** `public` (prod), `test` (test data) — kept in sync.

Applied migrations: `0001_init`, `0002_date_logs`, `0003_cover_photo`. Mirrored in `public` and `test`.

## Tables

### `profiles` (auth.users 1:1)
| col | type | notes |
| --- | --- | --- |
| id | uuid PK | → auth.users(id) cascade |
| nickname | text | not null |
| avatar_url | text | |
| created_at | timestamptz | default now() |

App upserts this after login (no auth trigger, to keep public/test schemas independent).

### `couples` (invite-code connect)
| col | type | notes |
| --- | --- | --- |
| id | uuid PK | gen_random_uuid() |
| created_by | uuid | → auth.users |
| partner_a | uuid | creator |
| partner_b | uuid null | joiner (null until connected) |
| invite_code | text unique | default 6-char upper hash |
| status | text | pending \| connected |
| created_at / connected_at | timestamptz | |

Indexes: `couples_partner_a_idx`, `couples_partner_b_idx`.

### Functions
- `join_couple(p_code text) → uuid` — SECURITY DEFINER. Sets `partner_b = auth.uid()`, status→connected for a matching pending code. Granted to `authenticated`.

## RLS policies (enabled on both tables)
- **profiles**: select own row + connected partner's row; insert/update own only.
- **couples**: select/update only the two partners; insert as `partner_a = auth.uid()`. Joining goes through `join_couple()` (definer) so a stranger can't read a couple by code.

### `places` (shared reference — Kakao place)
id, kakao_place_id (unique), name, category, address, lat, lng, created_at.
RLS: any authenticated user may select/insert.

### `date_logs` (couple-scoped)
id, couple_id → couples, author_id → auth.users, date, title, memo, cover_photo_path (date-photos 경로), created_at.
Index `date_logs_couple_date_idx (couple_id, date desc)`.

### `date_log_places` (date_log ↔ place)
id, date_log_id → date_logs, place_id → places, visit_order, rating (0-5), memo.
Index `date_log_places_log_idx (date_log_id)`.

### `routes` (one per date_log)
id, date_log_id (unique) → date_logs, coordinates jsonb, created_at.

RLS (date_logs / date_log_places / routes): FOR ALL, couple-scoped — only `partner_a`/`partner_b`
of the owning couple. `date_log_places`/`routes` inherit via join to `date_logs → couples`.

## Storage
- Bucket `date-photos` (private). Policy: authenticated users read/write within their own
  top-level folder (`<uid>/…`). Global (not schema-mirrored).

## Not yet migrated
그 외 확장(좋아요/댓글/공유 등)은 향후 마이그레이션.
