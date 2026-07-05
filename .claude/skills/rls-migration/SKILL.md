---
name: rls-migration
description: Use this skill when creating, editing, or reviewing a Supabase migration under supabase/migrations. Covers both schema DDL and matching Row Level Security policies. Trigger on "add migration", "새 테이블", "DB 스키마 수정", "RLS policy", "add column to <table>", or any file add/edit under supabase/migrations.
---

# rls-migration

Schema changes and RLS policies are versioned together in `supabase/migrations/NNNN_<name>.sql`. Migrations are **forward-only** — never edit a migration that has been applied to any environment; write a new one.

## Dual-schema rule (read this first)

The Supabase project hosts **two parallel schemas in the same project**: `public` (prod) and `test` (test data). Apps switch via `SUPABASE_DB_SCHEMA` env var. See `supabase/SCHEMA.md` § "Schema isolation" and `supabase/SETUP.md`.

**Hard rule:** any migration that adds, alters, or drops a table / index / policy / trigger / function in `public` MUST include a matching block for `test` in the same file. Acceptable shapes:

- Single migration with two parallel sections (one targeting `public.*`, one targeting `test.*`). Preferred for small, mechanical changes.
- A pair of sequential migrations `NNNN_change_public.sql` + `NNNN+1_change_test.sql`. Use when the public-side change is large enough that bundling them hurts readability.

Either way, do not let the two schemas drift. `test.set_updated_at` and `test.sync_crew_member_count` already exist as schema-local copies (see 0004) — when you add a new public function, mirror it to test the same way.

If you only need to change one schema (e.g., a hotfix on prod data), the migration must say so explicitly in a comment so a future reader doesn't assume the missing test mirror is an oversight.

## Token-economy rule (read this first)

`supabase/SCHEMA.md` is the **rolled-up source of truth** for the current schema state. Don't re-read every migration file to figure out what tables/columns/policies exist — read `SCHEMA.md`.

**Hard rule:** every migration that adds, alters, or drops anything in the DB MUST update `supabase/SCHEMA.md` in the same commit. No exceptions:

- New table → add a `### public.<table>` section with all columns, indexes, and RLS policies.
- New column → update the column table for that table.
- Drop / rename → remove or rename the entry; don't leave stale rows.
- New policy / changed policy → update the RLS section.
- New enum / function / trigger → update the `Enums` or `Functions / Triggers` section.
- New migration file → append a row to the `Migration log` table at the top.

If `SCHEMA.md` and the SQL files disagree, the SQL files are correct — fix `SCHEMA.md`.

When you need to know "what does table X look like right now?" — read `supabase/SCHEMA.md`. Reading every migration to reconstruct state is a waste of context.

## Conventions

- File name: zero-padded 4-digit sequence, e.g. `0003_add_events.sql`. Check the current highest number before creating.
- One logical change per file (one table, or one cross-cutting policy update). Don't pile unrelated DDL into one migration.
- Every new table ships with RLS **on the same migration or the immediately following one** — do not leave a table with RLS disabled between migrations.
- Default to `uuid` primary keys: `id uuid primary key default gen_random_uuid()`.
- Always include `created_at timestamptz not null default now()` and `updated_at timestamptz` where relevant. If `updated_at` is set, attach the existing `public.set_updated_at()` trigger.
- FKs: `references <table>(id) on delete cascade` (or `set null` if the child should survive).

## Steps when asked to add or alter a table

1. Read `supabase/SCHEMA.md` to learn the current state. Don't grep through migrations.
2. Read the latest numbered migration under `supabase/migrations/` to pick the next number.
3. Create `supabase/migrations/NNNN_<descriptive_name>.sql` — DDL first, then `alter table ... enable row level security`, then policies.
4. **Update `supabase/SCHEMA.md`** in the same change set:
   - append the new file to the `Migration log` table
   - add/edit table sections to reflect the new state
   - update enums / triggers / functions sections if those changed
5. If the API will read/write the new table, sanity-check `apps/api/src/supabase/supabase.service.ts` — server uses the service role key (bypasses RLS), clients on web/mobile use anon key + RLS.
6. Update `supabase/seed.sql` only if the new table needs example rows for local dev.
7. If the change introduces a new resource exposed to the apps, also update / add the matching Zod schema in `packages/shared` (use the `shared-schema` skill).

## Migration template (new table + RLS)

```sql
-- 0003_add_events.sql

create table public.events (
  id          uuid primary key default gen_random_uuid(),
  crew_id     uuid not null references public.crews(id) on delete cascade,
  title       text not null,
  starts_at   timestamptz not null,
  created_by  uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz
);

create index events_crew_id_idx  on public.events (crew_id);
create index events_starts_at_idx on public.events (starts_at);

alter table public.events enable row level security;

-- Anyone in the crew can read crew events.
create policy "events_select_crew_members"
  on public.events for select
  using (
    exists (
      select 1
      from public.crew_members cm
      where cm.crew_id = events.crew_id
        and cm.user_id = auth.uid()
    )
  );

-- Only crew admins can insert.
create policy "events_insert_crew_admin"
  on public.events for insert
  with check (
    exists (
      select 1
      from public.crew_members cm
      where cm.crew_id = events.crew_id
        and cm.user_id = auth.uid()
        and cm.role = 'admin'
    )
  );

-- Only the creator can update / delete.
create policy "events_update_creator"
  on public.events for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "events_delete_creator"
  on public.events for delete
  using (created_by = auth.uid());
```

After writing the SQL, the matching `SCHEMA.md` edit looks like this (paste under `## Tables`):

```md
### `public.events`
| col | type | notes |
| --- | --- | --- |
| `id` | uuid PK | `default gen_random_uuid()` |
| `crew_id` | uuid | NOT NULL → `crews(id)` ON DELETE CASCADE |
| `title` | text | NOT NULL |
| `starts_at` | timestamptz | NOT NULL |
| `created_by` | uuid | NOT NULL → `auth.users(id)` ON DELETE CASCADE |
| `created_at` | timestamptz | NOT NULL default now() |
| `updated_at` | timestamptz | nullable |

- Indexes: `events_crew_id_idx (crew_id)`, `events_starts_at_idx (starts_at)`
- RLS: **ON**
  - `SELECT` — crew members
  - `INSERT` — crew admins
  - `UPDATE` / `DELETE` — `created_by = auth.uid()`
```

## Altering an existing table

Use a new migration. Pattern:

```sql
-- 0004_events_add_location.sql
alter table public.events add column location text;
```

Then update the `events` row table in `SCHEMA.md` to include `location`.

If the change affects what anonymous/authenticated users can see, **also** drop and recreate the relevant policy in the same file — don't let policies drift from the column set — and update the RLS bullets in `SCHEMA.md`.

## Rules

- Never `drop table` or destructive changes without the user explicitly confirming.
- Never disable RLS on a public-facing table, even temporarily.
- If a policy references a column, that column must exist in the same migration or earlier.
- Prefer `security invoker` view/function defaults — avoid `security definer` unless the user explicitly needs superuser behavior.
- Do not put secrets, env-specific values, or hardcoded UUIDs in migrations. Seeding belongs in `supabase/seed.sql`.
- Never ship a migration without updating `SCHEMA.md` in the same commit.
