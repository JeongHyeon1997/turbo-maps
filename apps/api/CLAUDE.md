# apps/api — NestJS API

Root `CLAUDE.md` has cross-cutting rules (git, stack, atomic components, skills). This file is API-specific.

## Structure

- Entry: `src/main.ts` → `src/app.module.ts`.
- Feature modules: `auth/` only for now. Domain modules (`couples/`, `places/`, `date-logs/`, `routes/`) are added by `server-dev` via the `api-module` skill.
- Infra: `supabase/` (service wrapping `@supabase/supabase-js`), `common/` (Zod validation pipe + shared utils).
- Health: `src/health.controller.ts` (`/health`, `/health/db`).

## Rules

- **Supabase access** goes through `SupabaseService` (`apps/api/src/supabase/supabase.service.ts`). No ad-hoc `createClient` in controllers or services.
- **Auth:** authenticated endpoints → `@UseGuards(AuthGuard)` + `@CurrentUser()` for the user id.
- **Validation:** every mutating endpoint body → `new ZodValidationPipe(schema)` with a schema from `@maps/shared`. Never redefine schemas here.
- **DB naming:** snake_case in DB/service layer → camelCase at the API boundary (matching `@maps/shared` shapes). Consider a small per-resource mapper when non-trivial.
- **Type imports:** ESLint's `consistent-type-imports` is **off** here — NestJS decorator metadata needs many "type-looking" imports at runtime.

## Vercel (serverless)

- Deploys as a Vercel serverless function. Cold-start matters.
- Keep module graphs lean. Don't import heavy libs at top level if only one handler uses them.
- No long-lived state in services. No `SIGTERM` / shutdown hooks.
- Env vars read at cold start → keep `apps/api/.env.example` in sync with every new var, and mirror to Vercel project env.

## Scaffolding

New feature module → invoke the `api-module` skill. It creates module/controller/service and wires `AuthGuard` + `SupabaseModule` + `ZodValidationPipe` in the standard shape.

New DB table → invoke the `rls-migration` skill first (schema + RLS), then `api-module` to expose it.
