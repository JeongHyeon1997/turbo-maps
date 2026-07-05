---
name: shared-schema
description: Use this skill when adding, editing, or exporting a Zod schema in packages/shared — the single source of truth for types/DTOs shared between apps/api, apps/web, and apps/mobile. Trigger on requests like "add a schema for X", "X 타입 추가", "DTO 만들기", "validator for X", or any change to packages/shared/src/schemas/*.ts.
---

# shared-schema

`packages/shared` is the only place Zod schemas live. Do **not** duplicate them in apps.

## Layout

```
packages/shared/src/
├── schemas/
│   ├── crew.ts
│   ├── post.ts
│   ├── user.ts
│   └── <new>.ts
└── index.ts      ← re-exports every schema file
```

## Steps when asked to add a new schema

1. Create `packages/shared/src/schemas/<entity>.ts`.
2. Define schemas in this order: base → create-input → update-input → response. Derive types with `z.infer`.
3. Append `export * from "./schemas/<entity>";` to `packages/shared/src/index.ts`.
4. In the API, validate request bodies with the `ZodValidationPipe` (see `apps/api/src/common/zod.pipe.ts`) using the create/update schemas.
5. In web/mobile forms, reuse the same create/update schemas for client-side validation.

## Schema template

```ts
import { z } from "zod";

export const eventSchema = z.object({
  id: z.string().uuid(),
  crewId: z.string().uuid(),
  title: z.string().min(1).max(100),
  startsAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export const createEventInput = eventSchema
  .omit({ id: true, createdAt: true })
  .extend({
    // add create-only fields here
  });

export const updateEventInput = createEventInput.partial();

export type Event = z.infer<typeof eventSchema>;
export type CreateEventInput = z.infer<typeof createEventInput>;
export type UpdateEventInput = z.infer<typeof updateEventInput>;
```

## Rules

- Every exported schema comes with a matching inferred type. Downstream code imports the type, not the schema, unless it's actually validating.
- Dates go over the wire as ISO strings (`z.string().datetime()`), never `z.date()` — JSON can't carry Date.
- IDs are always `z.string().uuid()` — matches Supabase's default.
- Snake_case from the DB gets translated to camelCase at the API boundary. Schemas in shared are camelCase only.
- Never import from apps into packages. `packages/shared` has no app deps.
