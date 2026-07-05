# apps/mobile — Expo Router + React Native

Root `CLAUDE.md` has cross-cutting rules (git, stack, atomic components, skills). This file is mobile-specific.

## Structure

- Expo Router. Currently only `app/index.tsx` (entry). `app-dev` builds the route groups:
  - `app/(auth)/` — `login`, `signup`, `_layout`
  - `app/(tabs)/` — e.g. `home`(피드), `map`(지도/경로), `log`(기록 작성), `profile`, `_layout`
  - `app/index.tsx` — entry redirect
- Components: `src/components/{atoms,molecules,organisms,templates}/` — see root `CLAUDE.md`'s atomic-components section.
- Supabase client: `src/lib/supabase.ts` (wired with `@react-native-async-storage/async-storage` for session persistence).

## Rules

- **Primitives:** use `Pressable` / `TextInput` / `Text` / `View` — never `<button>` / `<input>` (those are web-only). Do not share component `.tsx` with `apps/web`.
- **Styles:** `StyleSheet.create` with tokens from `@maps/tokens`. No inline magic numbers. No `style={{ ... }}` where a `StyleSheet` entry would do.
- **React version** is pinned to what RN 0.76 expects (`react@18.3.x`, `@types/react@~18.3.12`). Do **not** upgrade mobile to React 19 to match web — Expo SDK 52 is on 18.3.
- **Metro/monorepo:** `metro.config.js` walks up to root `node_modules` on purpose. Do not re-add `disableHierarchicalLookup`.
- **Navigation:** use Expo Router's file-based routes + `Link` / `router.push`. No raw React Navigation unless we hit a hard limit.

## Deploy

- Expo Go for dev, EAS builds for store submission. **No Vercel involvement.**
- Env vars → `apps/mobile/.env.example`. Runtime env exposed via `expo-constants` extra.

## Scaffolding

- New component → invoke the `atomic-component` skill (target: `mobile`).
- New screen → add the file under the appropriate `app/(group)/` directory. Expo Router picks it up by filename.
