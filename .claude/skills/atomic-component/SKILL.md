---
name: atomic-component
description: Use this skill when creating, organizing, or refactoring reusable UI components in maps. Trigger whenever the user asks to build a Button, Input, Card, Header, Form, Modal, list item, or any other UI piece in apps/web or apps/mobile. Triggers on keywords — atomic, atom, molecule, organism, template, 공통 컴포넌트, 재사용 컴포넌트, 컴포넌트 만들기, UI 컴포넌트, reusable component, shared component, design system — and on any request that would create a .tsx component in apps/web/src/components or apps/mobile/src/components.
---

# atomic-component

Scaffold and organize maps UI components using atomic design. The goal is **many small, reusable components** — if a new screen is repeating JSX it's already wrong.

## Where components live

```
apps/web/src/components/       # Next.js / React DOM
  atoms/         Button, Input, Text, Icon, Avatar, Badge, Divider, Spinner
  molecules/     FormField, SearchBar, Card, ListItem, TabItem
  organisms/     Header, PostList, CrewCard, NavBar, CommentThread
  templates/     AuthLayout, DashboardLayout, ProfileLayout
  index.ts       barrel

apps/mobile/src/components/    # Expo / React Native
  atoms/
  molecules/
  organisms/
  templates/
  index.ts
```

Web and mobile keep **separate implementations** (different primitives: `<button>` vs `Pressable`, `<input>` vs `TextInput`). They share **tokens** (`@maps/tokens`) and **schemas** (`@maps/shared`). Do not try to share `.tsx` files across platforms unless the user explicitly asks — react-native-web / tamagui-style abstractions are out of scope until requested.

## Atomic level — how to choose

- **atom** — no dependencies on other app components. Pure primitive wrapping a native element + tokens. `Button`, `Text`, `Input`, `Icon`.
- **molecule** — composes 2–5 atoms into one labeled unit. `FormField` = `Label` + `Input` + `ErrorText`.
- **organism** — a meaningful standalone section on a page. `Header`, `PostList`, `CrewCard`.
- **template** — page-level layout shell with slots. No data fetching inside.

If unsure: start as an atom, promote later. Prefer many atoms over one big molecule.

## File layout per component

Use single-file components at first — promote to a folder only when you add tests, stories, or multiple related files.

```
atoms/Button.tsx          ← component
atoms/index.ts            ← re-exports every atom

atoms/Button/             ← promote when needed
  Button.tsx
  Button.types.ts
  Button.test.tsx
  index.ts
```

The level's `index.ts` is a barrel. Every new component must be added to it so imports stay clean:

```ts
// apps/web/src/components/atoms/index.ts
export * from "./Button";
export * from "./Input";
```

## Import rules

- **Tokens:** `import { theme } from "@maps/tokens"` — the single semantic layer (`theme.color.*`, `theme.space`, `theme.radius`, `theme.font.*`). On web prefer the wired Tailwind classes (generated from `theme.color`). No hard-coded hex, no magic pixel numbers.
- **Schemas:** `import { ... } from "@maps/shared"`. Validators live in `packages/shared`, never redefined in components.
- **Cross-level imports:** atoms → nothing. molecules → atoms only. organisms → atoms + molecules. templates → organisms + molecules + atoms. Never import upward.

## Web component template (atoms/Button.tsx)

On web, **prefer Tailwind classes** — the wired classes come from `theme.color.*`
(e.g. `bg-brand`, `text-text-primary`, `border-border`, `rounded-lg`, `shadow-md`).
Reach for `theme.*` in a `style={}` only when a token has no class (dynamic hex).

```tsx
import { theme } from "@maps/tokens";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "brand" | "secondary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const cls: Record<Variant, string> = {
  brand: "bg-brand text-white hover:bg-brand-pressed",
  secondary: "border border-brand text-brand",
  ghost: "text-text-primary",
};

export function Button({ variant = "brand", children, className = "", ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={`rounded-lg px-4 py-2 text-md font-bold ${cls[variant]} ${className}`}
      style={{ letterSpacing: theme.font.letterSpacingTight }}
    >
      {children}
    </button>
  );
}
```

## Mobile component template (atoms/Button.tsx)

Mobile has no Tailwind — consume `theme.*` (the same semantic layer) in `StyleSheet`.

```tsx
import { theme } from "@maps/tokens";
import { Pressable, PressableProps, Text, StyleSheet } from "react-native";
import { ReactNode } from "react";

type Variant = "brand" | "secondary" | "ghost";

export interface ButtonProps extends Omit<PressableProps, "children"> {
  variant?: Variant;
  children: ReactNode;
}

export function Button({ variant = "brand", children, style, ...rest }: ButtonProps) {
  return (
    <Pressable
      {...rest}
      style={[
        styles.base,
        variant === "brand" && styles.brand,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        typeof style === "function" ? undefined : style,
      ]}
    >
      <Text style={[styles.label, variant === "brand" && styles.labelOnBrand]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: theme.space[3], paddingHorizontal: theme.space[4], borderRadius: theme.radius.lg },
  brand: { backgroundColor: theme.color.brand },
  secondary: { borderWidth: 1, borderColor: theme.color.brand },
  ghost: { backgroundColor: "transparent" },
  label: { fontSize: theme.font.size.md, fontWeight: theme.font.weight.bold, color: theme.color.textPrimary },
  labelOnBrand: { color: theme.color.textOnBrand },
});
```

## Steps when the user asks for a new component

1. Confirm the target: `web`, `mobile`, or both (default: ask if ambiguous).
2. Classify the level. If unsure, default to `atom`.
3. Create `apps/<target>/src/components/<level>/<Name>.tsx` using the matching template above.
4. Add `export * from "./<Name>";` to `apps/<target>/src/components/<level>/index.ts` (create the file if missing).
5. Import only from `@maps/tokens`, `@maps/shared`, and lower atomic levels.
6. If the component needs variants/sizes — expose them as props with string unions, not boolean flags.
7. After creating, briefly tell the user the import path (`import { Button } from "@/components/atoms"` for web, relative or alias path for mobile depending on tsconfig).

## When NOT to create a component

- If the JSX appears exactly once in the entire app: inline it until it repeats.
- If it's a one-off page layout with no reusable structure: put it in the route file.

Atomic design is about **reuse**, not decoration. A component earns its file by being used more than once.
