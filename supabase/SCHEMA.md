# SCHEMA.md — rolled-up DB state (source of truth)

> Read this to know the current schema/RLS. **Don't** grep migrations to reconstruct state.
> Every new migration MUST update this file in the same commit (enforced by `rls-migration`).

**Project:** `giilijttitajvygdosbe` · **Schemas:** `public` (prod), `test` (test data) — kept in sync.

Applied migrations: `0001_init`. Mirrored in `public` and `test`.

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

## Not yet migrated (next: 0002)
`places`, `date_logs`, `date_log_places`, `routes` + Storage bucket for photos (dba).
