---
name: api-module
description: Use this skill when scaffolding, extending, or refactoring a NestJS feature module in apps/api — controller, service, module, DTO wiring, and app.module registration. Trigger on "add <resource> endpoints", "새 API 만들기", "scaffold module", "nest module for X", or any new folder under apps/api/src/* that represents a feature area.
---

# api-module

maps's API is NestJS on Vercel serverless functions. Data access goes through `SupabaseService` (no direct `@supabase/supabase-js` calls from controllers/services). Validation uses Zod schemas from `@maps/shared` via the `ZodValidationPipe` in `apps/api/src/common/zod.pipe.ts`.

## Layout per feature

```
apps/api/src/<resource>/
├── <resource>.module.ts
├── <resource>.controller.ts
└── <resource>.service.ts
```

For split-heavy modules, add a folder with `dto/`, `guards/`, `decorators/` as needed — but start flat.

## Steps when asked to add a new resource (e.g. `events`)

1. Add or confirm the Zod schema lives in `packages/shared/src/schemas/<resource>.ts` (if not, invoke the `shared-schema` skill first).
2. Confirm the DB table + RLS exist (if not, invoke `rls-migration` first).
3. Create the three files below.
4. Register the module in `apps/api/src/app.module.ts` imports array.
5. Make sure `AuthModule` / `SupabaseModule` are imported where needed — `AuthGuard` for authenticated endpoints, `SupabaseService` injected into the service.
6. Validate every mutating endpoint's body with `new ZodValidationPipe(<inputSchema>)`.

## Controller template

```ts
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { createEventInput, updateEventInput, CreateEventInput, UpdateEventInput } from "@maps/shared";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { ZodValidationPipe } from "../common/zod.pipe";
import { EventsService } from "./events.service";

@Controller("events")
@UseGuards(AuthGuard)
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  list(@CurrentUser() userId: string) {
    return this.events.list(userId);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.events.get(id);
  }

  @Post()
  create(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(createEventInput)) body: CreateEventInput,
  ) {
    return this.events.create(userId, body);
  }

  @Put(":id")
  update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateEventInput)) body: UpdateEventInput,
  ) {
    return this.events.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.events.remove(id);
  }
}
```

## Service template

```ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateEventInput, UpdateEventInput } from "@maps/shared";
import { SupabaseService } from "../supabase/supabase.service";

@Injectable()
export class EventsService {
  constructor(private readonly supabase: SupabaseService) {}

  async list(userId: string) {
    const { data, error } = await this.supabase.client
      .from("events")
      .select("*")
      .order("starts_at", { ascending: true });
    if (error) throw error;
    return data;
  }

  async get(id: string) {
    const { data, error } = await this.supabase.client
      .from("events")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async create(userId: string, input: CreateEventInput) {
    const { data, error } = await this.supabase.client
      .from("events")
      .insert({ ...input, created_by: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id: string, input: UpdateEventInput) {
    const { data, error } = await this.supabase.client
      .from("events")
      .update(input)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase.client.from("events").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  }
}
```

## Module template

```ts
import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";

@Module({
  imports: [AuthModule, SupabaseModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
```

## Vercel deployment notes

- `apps/api` runs as a Vercel serverless function. Cold-start matters — keep module graphs lean, don't import heavy libs at module top-level if they're only used in one handler.
- No long-lived state in services. Connection pooling is Supabase's job; don't cache `SupabaseClient` per request outside what `SupabaseService` already does.
- No `process.on("SIGTERM")` style shutdown hooks — serverless instances are killed between invocations.
- Env vars are read at cold start. Add new vars to `apps/api/.env.example` so future deploys don't miss them.

## Rules

- Every authenticated endpoint: `@UseGuards(AuthGuard)` + `@CurrentUser()` for the user id.
- Every mutating body: `ZodValidationPipe` with a schema from `@maps/shared`.
- DB column names stay snake_case in the service layer; translate to camelCase when the API needs to return a shape matching `@maps/shared` (consider a small mapper helper per resource if it's non-trivial).
- No raw `createClient` calls outside `SupabaseService`.
