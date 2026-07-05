# apps/web — Next.js 15 (App Router)

Root `CLAUDE.md` has cross-cutting rules (git, stack, atomic components, skills). This file is web-specific.

## Structure

- App Router under `src/app/`.
- Components: `src/components/{atoms,molecules,organisms,templates}/` — see root `CLAUDE.md`'s atomic-components section.
- Supabase clients: `src/lib/supabase/client.ts` (browser) · `src/lib/supabase/server.ts` (RSC / route handlers).
- Styling: Tailwind (`tailwind.config.ts`, `postcss.config.js`) + `src/app/globals.css`.

## Rules

- Default to **server components**; add `"use client"` only where interactivity actually needs it.
- Use `React.ReactNode` (UMD global form) in layout/page type signatures instead of `import type { ReactNode } from 'react'`. Next 15 + `@types/react@19.2` has a divergence between the module-exported `ReactNode` (includes `bigint`) and the namespace `React.ReactNode` used by Next's generated `LayoutProps`. Match the canonical pattern:

  ```tsx
  export default function RootLayout({
    children,
  }: Readonly<{ children: React.ReactNode }>) { ... }
  ```

- Do **not** re-add `typeRoots: ["./node_modules/@types"]` to `tsconfig.json`. It breaks bun-workspace hoist resolution — we removed it deliberately.
- Tailwind class order is handled by Prettier's Tailwind plugin if wired; don't hand-sort.

## Vercel

- Standard Next.js project. ISR / edge runtime decisions are per-route; default to dynamic SSR with sensible caching.
- Env vars → `apps/web/.env.example`. Keep it in sync with every new var and mirror to the Vercel project env.
- Public env vars must be `NEXT_PUBLIC_`-prefixed to reach the browser bundle.

## Scaffolding

- New component → invoke the `atomic-component` skill (target: `web`).
- New API call from the client → import validated Zod schemas from `@maps/shared` and reuse them for form validation too.
