# Supabase setup — applying migrations to the maps project

This project ships **forward-only migrations** under `supabase/migrations/`. The Supabase CLI is not required — every migration can be pasted into the project's SQL Editor in order.

The same Supabase project hosts **two schemas**, `public` (prod) and `test` (test data). Apps select between them with `SUPABASE_DB_SCHEMA` env var. `auth.users` itself is shared per project.

> Project ref: **`giilijttitajvygdosbe`** → `https://giilijttitajvygdosbe.supabase.co`

---

## Current state

No migrations yet — the DB is a clean slate. The `db-dev` role writes the first migration (couples / places / date_logs / routes) via the `rls-migration` skill, guided by the data model in `docs/plan/`. `SCHEMA.md` is the rolled-up source of truth for whatever exists.

## One-time setup

### 1. Fill `.env` files locally

Each app expects credentials in its own env file. Templates are in `*.env.example`. Keys:

- `SUPABASE_URL` — `https://giilijttitajvygdosbe.supabase.co`
- `SUPABASE_ANON_KEY` — Dashboard → Settings → API → `anon public`
- `SUPABASE_SERVICE_ROLE_KEY` — Dashboard → Settings → API → `service_role secret` (**api only**, never to client apps)
- `SUPABASE_JWT_SECRET` — Dashboard → Settings → API → JWT secret (api only)
- `SUPABASE_DB_SCHEMA` — `public` or `test`
- Kakao: `NEXT_PUBLIC_KAKAO_MAP_KEY` (web JS key) / `EXPO_PUBLIC_KAKAO_MAP_KEY` (mobile) / `KAKAO_REST_API_KEY` (api)

Files (gitignored):

| App | Env file | Public prefix |
| --- | --- | --- |
| `apps/api` | `.env` | — |
| `apps/web` | `.env.local` | `NEXT_PUBLIC_` |
| `apps/mobile` | `.env` | `EXPO_PUBLIC_` |

### 2. Apply migrations in order (once they exist)

Dashboard → **SQL Editor** → New query. Paste each `supabase/migrations/NNNN_*.sql` in order and Run.

### 3. Expose the `test` schema to PostgREST

Dashboard → **Project Settings → API** → **Exposed schemas** — add `test` next to `public` and `graphql_public`. Save. (Without this, `db.schema('test')` returns 404.)

### 4. Smoke-test

Start the api (`bun run api`), hit `GET http://localhost:4000/api/health/db`. Returns `ok:true` once `profiles` exists in the active schema.

---

## When you change the schema later

Use the `rls-migration` skill. Two enforced rules:

1. **`SCHEMA.md` stays in sync** — update it in the same commit as the migration.
2. **`public` and `test` stay in sync** — every public-schema DDL needs a parallel test-schema block in the same migration.

---

## Key rotation (IMPORTANT)

If a service-role key / DB password has been exposed (committed, pasted into chat, etc.), rotate it: Dashboard → Settings → API → **Reset service_role secret**, and Settings → Database → reset password. The anon key is safe in client bundles.
