# maps

**maps** — 커플이 함께 다닌 **데이트 · 맛집 · 경로**를 기록하는 커뮤니티 앱/웹 (web + mobile + api). Bun + Turborepo monorepo.

> 커플이 방문한 장소(맛집/카페/데이트 스팟), 그날의 경로(이동 동선), 사진·메모·평점을 기록하고 함께 되돌아보는 서비스. 지도는 **Kakao Map** 기준.

Per-workspace details live in each app's own `CLAUDE.md` — this root doc holds **cross-cutting** rules only. Load order is hierarchical: the file you're editing pulls in the nearest `CLAUDE.md` in its path, so `apps/api/CLAUDE.md` only appears in context when you're touching `apps/api/**`. Don't copy app-specific rules back into this file.

## Git workflow

- Solo development on `main` — commit and push directly to `main` without asking.
- Commit autonomously in logical units as work completes; user pre-authorized this.
- Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat(scope):`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).
- Push to `origin main` after each commit (or batch).
- Remote: `git@github.com:JeongHyeon1997/turbo-maps.git`
- Confirm before destructive ops (`--force`, `reset --hard`, branch deletion).

## Stack

- Bun 1.3 + Turborepo 2 · Node ≥ 20 · TypeScript everywhere.
- Supabase (Postgres + RLS) for auth/DB/storage. Project ref `giilijttitajvygdosbe`.
- **Kakao Map** for places/geocoding/route rendering.
- Zod for validation — schemas live **only** in `packages/shared`.
- Deploy: Vercel (web + api) · Expo/EAS (mobile).

## Repo layout

```
maps/
├── apps/
│   ├── api/        NestJS API     → apps/api/CLAUDE.md
│   ├── web/        Next.js 15     → apps/web/CLAUDE.md
│   └── mobile/     Expo + RN      → apps/mobile/CLAUDE.md
├── packages/
│   ├── shared/     Zod 스키마 (couple/place/date-log/route) — single source of truth
│   └── tokens/     Design tokens (colors/spacing/typography)
├── supabase/       migrations · RLS · SCHEMA.md · config.toml
├── docs/           기획·진행 문서 (planner 소유) — 세션이 끊겨도 이어서 작업하는 근거
├── DESIGN.md       디자인 시스템 방향 (designer 소유)
└── .claude/
    ├── agents/     역할별 서브에이전트 (planner/designer/web/app/server/db/dba/schema/reviewer/build-qa)
    └── skills/     Claude Code skills (see below)
```

## Root scripts

```sh
bun run dev        # all apps (turbo)
bun run web        # next dev
bun run mobile     # expo start
bun run api        # nest dev
bun run build
bun run lint
bun run typecheck
bun run format     # prettier --write .
```

## Domain glossary (러닝 아님 — 커플 기록 앱)

- **couple** — 두 유저를 잇는 커플 단위. 대부분의 기록은 커플에 귀속.
- **place** — 방문한 장소(맛집/카페/데이트 스팟). Kakao place id로 식별.
- **date-log** — 하루의 데이트 기록. 여러 place + 사진 + 메모 + 평점.
- **route** — 그날의 이동 경로(좌표 시퀀스). date-log에 붙는다.

## Atomic components

Both web and mobile hold components under `src/components/{atoms,molecules,organisms,templates}/`. User strongly prefers **many small, reusable components** and **Atomic Design** throughout:

- **atom** — primitive wrapping a native element + tokens.
- **molecule** — 2–5 atoms composed (FormField, SearchBar).
- **organism** — standalone meaningful section (Header, PlaceList, RouteMap).
- **template** — page-level layout shell with slots.

Rules:

- One-file-per-component until a folder is warranted. Add to the level's `index.ts` barrel.
- Cross-level imports go **downward only** (atoms → nothing app-internal · molecules → atoms · organisms → atoms + molecules · templates → all three). Never upward.
- Use `@maps/tokens` for colors / spacing / typography. No hard-coded UI values.
- Web and mobile keep **separate implementations** — different primitives. Only tokens and schemas cross the platform boundary.
- Follow `DESIGN.md` for visual direction (warm/personal). Repeating JSX = a smell. Extract.

Scaffold via the `atomic-component` skill.

## Skills (`.claude/skills/`)

| Skill | Use when |
| --- | --- |
| `atomic-component` | creating/organizing web or mobile UI components |
| `shared-schema` | adding a Zod schema to `packages/shared` |
| `api-module` | scaffolding a NestJS feature module |
| `rls-migration` | adding a Supabase migration + RLS |

Prefer invoking a skill over ad-hoc scaffolding when the task matches one.

## Roles (`.claude/agents/`)

작업은 역할별 서브에이전트로 위임된다. 큰 요청이 오면 알맞은 역할로 자동 분배된다.

| 역할 | 모델 | 담당 |
| --- | --- | --- |
| `planner` | Opus | 기획·데이터모델·진행문서(`docs/`) 작성, 커밋/푸시 |
| `designer` | Opus | `DESIGN.md`·디자인 토큰·Atomic Design 시스템, 디자인 스킬 |
| `web-dev` | Sonnet | apps/web (Next.js) |
| `app-dev` | Sonnet | apps/mobile (Expo/RN) |
| `server-dev` | Sonnet | apps/api (NestJS) |
| `db-dev` | Sonnet | supabase 마이그레이션 DDL + RLS *작성* |
| `dba` | Sonnet | 라이브 Supabase에 스키마 *적용* + 인덱스/성능 최적화·운영 |
| `schema-dev` | Sonnet | packages/shared Zod 스키마 |
| `reviewer` | Opus | 정확성·규칙 준수·중복 검수 (읽기 전용) |
| `build-qa` | Sonnet | build/lint/typecheck/스모크 QA, 회귀 확인 |

## docs 진행 규칙 (세션이 끊겨도 이어서)

`docs/`는 **터미널이 끊기거나 컨텍스트가 초기화돼도 다음 세션이 그대로 이어받을 수 있게** 하는 단일 진실이다. 자세한 규칙은 `docs/README.md` 참고. 핵심:

- `docs/PROGRESS.md` — 지금까지 한 일 / 지금 하는 일 / 다음 할 일 / 막힌 것. **작업 시작 시 먼저 읽고, 의미 있는 진전마다 갱신 후 커밋.**
- `docs/plan/` — 기능별 계획서. planner가 작성.
- 새 세션의 첫 행동: `docs/PROGRESS.md` → 관련 `docs/plan/*` 를 읽어 상태 복원.

## Cross-cutting conventions

- **Shared types/validators:** `packages/shared` only. Never duplicate Zod schemas across apps.
- **Design tokens:** `packages/tokens` only. No hard-coded UI values. Visual direction in `DESIGN.md`.
- **Supabase access** from the API goes through `SupabaseService` (apps/api). Never instantiate raw clients in controllers.
- **Secrets:** never commit. `.env*` is gitignored; each app has `.env.example` with placeholders only.
- **RLS-first:** when touching DB schema, add the RLS policy in the same (or immediately next) migration. Never leave a public table with RLS off.
- **DB state lookup:** read `supabase/SCHEMA.md` for the current schema/RLS — the rolled-up source of truth. Every new migration MUST update `SCHEMA.md` in the same commit.
- **Two schemas, one project:** `public` (prod) and `test` (test data) live side-by-side in the same Supabase project; apps switch via `SUPABASE_DB_SCHEMA`. New public-schema migrations need a parallel `test` block. See `supabase/SETUP.md`.

## Working in a specific app

When a task is clearly scoped to one app, stay inside that app's tree — don't scan other apps. The nearest `CLAUDE.md` will tell you the local rules; this root doc covers only what's shared.
