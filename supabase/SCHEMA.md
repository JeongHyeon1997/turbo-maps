# SCHEMA.md — rolled-up DB state (source of truth)

> Read this to know the current schema/RLS. **Don't** grep migrations to reconstruct state.
> Every new migration MUST update this file in the same commit (enforced by `rls-migration`).

**Project:** `giilijttitajvygdosbe` · **Schemas:** `public` (prod), `test` (test data) — kept in sync.

Applied migrations: `0001_init`, `0002_date_logs`, `0003_cover_photo`, `0004_visibility`, `0005_date_log_photos`, `0006_public_explore`, `0007_public_detail`. Mirrored in `public` and `test`.

**Not yet applied to the live DB:** `0005_date_log_photos`, `0006_public_explore`,
`0007_public_detail` (see `docs/PROGRESS.md` § Blocked — dba to apply together). This
file describes the schema these migrations *will* produce once applied.

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
- **profiles**: select own row + connected partner's row + (since `0004_visibility`) any row when authenticated; insert/update own only.
- **couples**: select/update only the two partners; insert as `partner_a = auth.uid()`. Joining goes through `join_couple()` (definer) so a stranger can't read a couple by code.

### `places` (shared reference — Kakao place)
id, kakao_place_id (unique), name, category, address, lat, lng, created_at.
RLS: any authenticated user may select/insert.

### `date_logs` (couple-scoped)
id, couple_id → couples, author_id → auth.users, date, title, memo, cover_photo_path (date-photos 경로,
private original), visibility (`private` default | `public`, checked), created_at,
**public_cover_path** (text, nullable, added `0006` — path within the `public-covers` bucket for the
copy-on-publish cover; `null` = private or no cover copied yet. `date-photos`/`cover_photo_path` stay
private always — only an explicit copy in `public-covers` is ever anon-readable).
Indexes: `date_logs_couple_date_idx (couple_id, date desc)`, `date_logs_public_idx (visibility, date desc)`.

### `date_log_places` (date_log ↔ place)
id, date_log_id → date_logs, place_id → places, visit_order, rating (0-5), memo.
Index `date_log_places_log_idx (date_log_id)`.

### `routes` (one per date_log)
id, date_log_id (unique) → date_logs, coordinates jsonb, created_at.

### `date_log_photos` (date_log gallery — many photos per log)
| col | type | notes |
| --- | --- | --- |
| `id` | uuid PK | `default gen_random_uuid()` |
| `date_log_id` | uuid | NOT NULL → `date_logs(id)` ON DELETE CASCADE |
| `storage_path` | text | NOT NULL — path within `date-photos` bucket (`<uid>/<uuid>-name`) |
| `caption` | text | nullable |
| `sort_order` | int | NOT NULL default 0 |
| `created_at` | timestamptz | NOT NULL default now() |

Index: `date_log_photos_log_idx (date_log_id, sort_order)`.

RLS (date_logs / date_log_places / routes / date_log_photos): FOR ALL, couple-scoped — only
`partner_a`/`partner_b` of the owning couple. `date_log_places`/`routes`/`date_log_photos` inherit
via join to `date_logs → couples`. `date_log_photos` has no public-select policy — even when a
date_log is `visibility = 'public'`, its photo gallery stays couple-only (like memo).

`date_logs`/`date_log_places`/`routes` have **no base-table public-select policy** — the
`0004_visibility` public-select policies (recreated `to authenticated` in `0006_public_explore`)
were **dropped in `0007_public_detail`** and not replaced. Public/anon reads of public date_logs
go exclusively through the `explore_logs`/`explore_log_places` views (see below); `routes` has no
public view at all — route polylines are never exposed publicly, by product decision (public
detail pages show visited-place markers only). Couple-scoped RW policies from `0002`/`0005`
(`auth.uid() = partner_a/partner_b` of the owning couple) are unaffected and still make a couple's
own `/logs/[id]` work. `profiles` also has a public-select policy allowing any authenticated user
to read any profile row (nickname/avatar) — kept for partner-avatar lookups in the app header;
`explore_logs` no longer joins `profiles` (see `0007` below), so this policy is not needed for
explore anymore, but other UI still depends on it.

### anon / `/explore` public surface (`0006_public_explore`, tightened in `0007_public_detail`)

**anon never gets row-select access to base tables** — RLS row-policies can't hide a column
(e.g. `date_logs.memo`), so anon reads public data only through two safe views, never
`date_logs`/`date_log_places`/`routes` directly:

- `0006` first recreated the `0004` public-select policies on `date_logs`/`date_log_places`/
  `routes` scoped `to authenticated` (closing an unscoped-role gap where they previously had no
  `to` clause → defaulted to PUBLIC/all roles, which combined with Supabase's default anon table
  grant meant anon could already select public `date_logs` rows directly, memo included).
- **`0007_public_detail` went further and DROPPED those `to authenticated` policies entirely
  (not replaced).** Rationale (`docs/DECISIONS.md` 2026-07-07): `to authenticated` still let any
  *logged-in* user query `date_logs`/`date_log_places` directly for someone else's public log and
  read `memo` — the anon-safe views never had this hole, but the base tables still did for
  authenticated users. Public reads (anon and authenticated alike) are now served **only** through
  the views below. Couple-scoped RW policies (`0002`/`0005`, gated on
  `auth.uid() = partner_a/partner_b`) are untouched, so a couple's own `/logs/[id]` still works.
  `routes` now has **no public-select policy and no public view** — route polylines are never
  exposed publicly (product decision: public detail shows visited-place markers only, never the
  path between them).
- `0006` also `revoke select ... from anon` on `date_logs` / `date_log_places` / `routes` as
  defense in depth, on top of the RLS scoping above (still in effect).
- Two views expose only safe, public-row data to `anon` (and `authenticated`):
  - **`explore_logs`** — `id, couple_id, date, title, public_cover_path, created_at`. **No
    `memo`, no `cover_photo_path` (private original), no `author_id`, and — as of `0007` — no
    `author_nickname`/`profiles` join at all** (public surfaces are anonymized by product
    decision; the app renders a generic "anonymous couple" label instead of a real nickname).
  - **`explore_log_places`** — `id, date_log_id, place_id, visit_order, rating, name, category,
    address, lat, lng` (joined from `places`). **No `date_log_places.memo`.** Unchanged by `0007`.
  - Both views: `where visibility = 'public'` hardcoded into the view definition, created with
    `security_invoker = false` (Postgres default, set explicitly) so they evaluate as their owner
    (RLS-exempt table owner) — the view's own `where` clause, not RLS, is what limits exposure.
    `grant select ... to anon, authenticated`.
  - **Caveat for whoever applies this live:** the owner-bypass trick above only works if the role
    that runs the migration owns `date_logs`/`profiles`/`places`/`date_log_places` (true for the
    default Supabase SQL-editor `postgres` role) and those tables never get
    `force row level security` set. dba should verify post-apply: `anon` querying `explore_logs`/
    `explore_log_places` returns public rows; `anon` **and now also authenticated** querying
    `date_logs`/`date_log_places`/`routes` directly for someone else's public log returns 0 rows
    (permission denied or empty, not an error that leaks column existence) — this is the concrete
    regression test for the `0007` backlog fix.

## Storage
- Bucket `date-photos` (private). Policy: authenticated users read/write within their own
  top-level folder (`<uid>/…`). Global (not schema-mirrored).
- Bucket `public-covers` (**public**, added `0006`) — copy-on-publish target for public date-log
  covers only (never the private originals in `date-photos`). Policy: authenticated users
  read/write/delete only within their own top-level folder (`<uid>/…`); **SELECT is open to
  anyone including anon** (`public_covers_public_read`, no folder scoping on reads — this bucket
  only ever holds explicitly-published copies). Global (not schema-mirrored). Public object URL:
  `/storage/v1/object/public/public-covers/<path>`.

## Views
- **`explore_logs`**, **`explore_log_places`** (added `0006`, `explore_logs` redefined
  anonymized in `0007`, public + test) — anon-safe projections for `/explore` and
  `/explore/[id]`. See "anon / `/explore` public surface" above for columns/grants. These are
  the **only** paths anon (and authenticated) has into date-log data as of `0007` — the base
  tables carry no public-select policy at all anymore. Do not add anon/authenticated public
  grants or policies back onto the base tables — extend the views instead, keeping their column
  list free of `memo`-like fields and (per product decision) real author identity.

## Not yet migrated
그 외 확장(좋아요/댓글/공유 등)은 향후 마이그레이션.
